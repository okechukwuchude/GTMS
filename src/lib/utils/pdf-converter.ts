/**
 * PDF to Image Conversion Utility
 * Converts PDF pages to images for Vision API processing
 * Uses pdftoppm from Poppler directly for reliability
 */

import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Convert PDF buffer to image buffer(s)
 * For OCR purposes, we typically process the first page only
 *
 * @param pdfBuffer - PDF file buffer
 * @param options - Conversion options
 * @returns Array of image buffers (JPEG format)
 */
export async function convertPdfToImages(
  pdfBuffer: Buffer,
  options: {
    maxPages?: number // Max number of pages to convert (default: 1)
    density?: number // DPI for conversion (default: 300)
    quality?: number // JPEG quality 1-100 (default: 95)
  } = {}
): Promise<Buffer[]> {
  const { maxPages = 1, density = 300, quality = 95 } = options

  // Create temporary directory for PDF conversion
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gtms-pdf-'))
  const pdfPath = path.join(tempDir, 'input.pdf')
  const outputPrefix = path.join(tempDir, 'page')

  try {
    // Write PDF buffer to temporary file
    await fs.writeFile(pdfPath, pdfBuffer)
    console.log(`[PDF Converter] Saved PDF to temp file: ${pdfPath}`)

    // Use pdftoppm to convert PDF pages to PNG
    // pdftoppm options:
    // -png: output PNG format
    // -r: resolution (DPI)
    // -f: first page
    // -l: last page
    // -singlefile: for single page output, use simpler naming
    const command = `pdftoppm -png -r ${density} -f 1 -l ${maxPages} "${pdfPath}" "${outputPrefix}"`
    console.log(`[PDF Converter] Executing: ${command}`)

    const { stdout, stderr } = await execAsync(command)
    if (stderr) {
      console.log(`[PDF Converter] pdftoppm stderr:`, stderr)
    }

    // Read generated PNG files and convert to JPEG
    const imageBuffers: Buffer[] = []
    const files = await fs.readdir(tempDir)

    // pdftoppm creates files like: page-1.png, page-2.png, etc.
    const pngFiles = files
      .filter(f => f.startsWith('page-') && f.endsWith('.png'))
      .sort() // Ensure correct page order
      .slice(0, maxPages)

    console.log(`[PDF Converter] Found ${pngFiles.length} PNG file(s):`, pngFiles)

    for (const pngFile of pngFiles) {
      const pngPath = path.join(tempDir, pngFile)
      console.log(`[PDF Converter] Processing ${pngFile}...`)

      // Read PNG file
      const pngBuffer = await fs.readFile(pngPath)

      // Convert PNG to JPEG and optimize with sharp
      const optimizedBuffer = await sharp(pngBuffer)
        .jpeg({ quality, mozjpeg: true })
        .toBuffer()

      imageBuffers.push(optimizedBuffer)
      console.log(`[PDF Converter] Converted ${pngFile} (${optimizedBuffer.length} bytes)`)
    }

    if (imageBuffers.length === 0) {
      throw new Error('Failed to convert any pages from PDF. No PNG files were generated.')
    }

    console.log(`[PDF Converter] Successfully converted ${imageBuffers.length} page(s)`)
    return imageBuffers

  } catch (error) {
    console.error('[PDF Converter] Conversion error:', error)
    if (error instanceof Error && error.message.includes('pdftoppm')) {
      throw new Error('PDF conversion failed. Please ensure the PDF is valid and not password-protected.')
    }
    throw new Error('Failed to convert PDF to images. Please ensure the PDF is valid and not corrupted.')
  } finally {
    // Clean up temporary files
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
      console.log('[PDF Converter] Cleaned up temp files')
    } catch (cleanupError) {
      console.warn('[PDF Converter] Failed to clean up temp files:', cleanupError)
    }
  }
}

/**
 * Check if a buffer is a PDF file
 * @param buffer - File buffer
 * @returns true if buffer is a PDF
 */
export function isPdfBuffer(buffer: Buffer): boolean {
  // PDF files start with %PDF-
  return buffer.length >= 5 &&
         buffer[0] === 0x25 && // %
         buffer[1] === 0x50 && // P
         buffer[2] === 0x44 && // D
         buffer[3] === 0x46 && // F
         buffer[4] === 0x2D    // -
}

/**
 * Get number of pages in a PDF
 * Quick estimation by counting /Page objects
 * @param buffer - PDF buffer
 * @returns Estimated page count
 */
export function estimatePdfPageCount(buffer: Buffer): number {
  const pdfString = buffer.toString('latin1')
  // Count /Type /Page occurrences (not perfect but good estimate)
  const matches = pdfString.match(/\/Type\s*\/Page[^s]/g)
  return matches ? matches.length : 1
}
