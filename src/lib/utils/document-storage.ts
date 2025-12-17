/**
 * Document Storage Utility
 * Handles temporary storage of uploaded documents for OCR processing
 */

import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import { generateUniqueFilename } from './file-validation'

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const unlink = promisify(fs.unlink)
const mkdir = promisify(fs.mkdir)
const stat = promisify(fs.stat)

/**
 * Upload directory configuration
 * Defaults to /tmp/gtms-uploads for temporary storage
 */
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/gtms-uploads'

/**
 * Document metadata interface
 */
export interface DocumentMetadata {
  documentId: string
  documentPath: string
  documentUrl: string
  originalFilename: string
  fileSize: number
  mimeType: string
  uploadedAt: string
}

/**
 * Ensure upload directory exists
 * Creates directory if it doesn't exist
 */
async function ensureUploadDirExists(): Promise<void> {
  try {
    await stat(UPLOAD_DIR)
  } catch (error) {
    // Directory doesn't exist, create it
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

/**
 * Save uploaded document to filesystem
 * @param fileBuffer - File contents as Buffer
 * @param originalFilename - Original filename from upload
 * @param mimeType - MIME type of the file
 * @param userId - Optional user ID for organizing files
 * @returns Document metadata including storage path and URL
 */
export async function saveDocument(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
  userId?: string
): Promise<DocumentMetadata> {
  // Ensure upload directory exists
  await ensureUploadDirExists()

  // Generate unique filename
  const documentId = generateUniqueFilename(originalFilename, userId)
  const documentPath = path.join(UPLOAD_DIR, documentId)

  // Write file to disk
  await writeFile(documentPath, fileBuffer)

  // Get file stats
  const stats = await stat(documentPath)

  // Generate metadata
  const metadata: DocumentMetadata = {
    documentId,
    documentPath,
    documentUrl: `/uploads/${documentId}`, // Relative URL for API access
    originalFilename,
    fileSize: stats.size,
    mimeType,
    uploadedAt: new Date().toISOString(),
  }

  return metadata
}

/**
 * Retrieve document from filesystem
 * @param documentId - Document ID (filename)
 * @returns Document buffer and metadata
 */
export async function getDocument(documentId: string): Promise<{
  buffer: Buffer
  metadata: {
    path: string
    size: number
    mimeType: string
  }
}> {
  const documentPath = path.join(UPLOAD_DIR, documentId)

  // Check if file exists
  const stats = await stat(documentPath)

  // Read file
  const buffer = await readFile(documentPath)

  // Determine MIME type from extension
  const extension = path.extname(documentId).toLowerCase()
  const mimeTypeMap: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
  }

  return {
    buffer,
    metadata: {
      path: documentPath,
      size: stats.size,
      mimeType: mimeTypeMap[extension] || 'application/octet-stream',
    },
  }
}

/**
 * Delete document from filesystem
 * @param documentId - Document ID (filename)
 * @returns True if deleted, false if not found
 */
export async function deleteDocument(documentId: string): Promise<boolean> {
  const documentPath = path.join(UPLOAD_DIR, documentId)

  try {
    await unlink(documentPath)
    return true
  } catch (error) {
    // File doesn't exist or couldn't be deleted
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false // File not found
    }
    throw error // Other error, re-throw
  }
}

/**
 * Clean up old temporary files (older than 24 hours)
 * Recommended to run this periodically (e.g., daily cron job)
 */
export async function cleanupOldDocuments(): Promise<{
  deletedCount: number
  errors: string[]
}> {
  const readdir = promisify(fs.readdir)
  const now = Date.now()
  const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  let deletedCount = 0
  const errors: string[] = []

  try {
    const files = await readdir(UPLOAD_DIR)

    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file)

      try {
        const stats = await stat(filePath)

        // Check if file is older than 24 hours
        if (now - stats.mtimeMs > maxAge) {
          await unlink(filePath)
          deletedCount++
        }
      } catch (error) {
        errors.push(`Failed to process ${file}: ${error}`)
      }
    }
  } catch (error) {
    errors.push(`Failed to read upload directory: ${error}`)
  }

  return { deletedCount, errors }
}

/**
 * Get storage statistics
 * @returns Storage usage information
 */
export async function getStorageStats(): Promise<{
  totalFiles: number
  totalSizeBytes: number
  totalSizeMB: number
  uploadDir: string
}> {
  const readdir = promisify(fs.readdir)

  try {
    const files = await readdir(UPLOAD_DIR)
    let totalSizeBytes = 0

    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file)
      try {
        const stats = await stat(filePath)
        totalSizeBytes += stats.size
      } catch {
        // Skip files that can't be read
      }
    }

    return {
      totalFiles: files.length,
      totalSizeBytes,
      totalSizeMB: totalSizeBytes / (1024 * 1024),
      uploadDir: UPLOAD_DIR,
    }
  } catch (error) {
    return {
      totalFiles: 0,
      totalSizeBytes: 0,
      totalSizeMB: 0,
      uploadDir: UPLOAD_DIR,
    }
  }
}
