/**
 * OCR Document Upload API Route
 * POST /api/ocr/upload
 * Accepts multipart/form-data with file upload
 */

import { NextRequest, NextResponse } from 'next/server'
import formidable from 'formidable'
import { Readable } from 'stream'
import { validateFile } from '@/lib/utils/file-validation'
import { saveDocument } from '@/lib/utils/document-storage'
import { createClient } from '@/lib/supabase/server'

// Disable Next.js body parsing to handle multipart/form-data manually
export const dynamic = 'force-dynamic'

/**
 * Convert NextRequest to Node.js IncomingMessage for formidable
 * Formidable expects Node.js streams, but Next.js uses Web API Request
 */
async function requestToReadable(request: NextRequest): Promise<Readable> {
  const reader = request.body?.getReader()
  if (!reader) {
    throw new Error('Request body is empty')
  }

  const readable = new Readable({
    async read() {
      const { done, value } = await reader.read()
      if (done) {
        this.push(null)
      } else {
        this.push(Buffer.from(value))
      }
    },
  })

  return readable
}

/**
 * Parse multipart form data using formidable
 */
async function parseForm(request: NextRequest): Promise<{
  fields: formidable.Fields
  files: formidable.Files
}> {
  const form = formidable({
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024,
    allowEmptyFiles: false,
    multiples: false, // Only allow single file upload
  })

  const readable = await requestToReadable(request)

  return new Promise((resolve, reject) => {
    form.parse(readable as any, (err, fields, files) => {
      if (err) {
        reject(err)
      } else {
        resolve({ fields, files })
      }
    })
  })
}

/**
 * POST /api/ocr/upload
 * Upload document for OCR processing
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Parse multipart form data
    let fields: formidable.Fields
    let files: formidable.Files

    try {
      const parsed = await parseForm(request)
      fields = parsed.fields
      files = parsed.files
    } catch (parseError) {
      console.error('Form parsing error:', parseError)
      return NextResponse.json(
        {
          error: 'Failed to parse upload',
          details:
            parseError instanceof Error
              ? parseError.message
              : 'Unknown error',
        },
        { status: 400 }
      )
    }

    // Extract uploaded file
    const fileArray = files.file
    if (!fileArray || fileArray.length === 0) {
      return NextResponse.json(
        { error: 'No file uploaded. Please select a file.' },
        { status: 400 }
      )
    }

    const uploadedFile = Array.isArray(fileArray) ? fileArray[0] : fileArray

    // Validate file
    const validation = validateFile({
      mimetype: uploadedFile.mimetype || 'application/octet-stream',
      size: uploadedFile.size,
      originalFilename: uploadedFile.originalFilename || 'unknown',
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Read file buffer
    const fs = await import('fs/promises')
    const fileBuffer = await fs.readFile(uploadedFile.filepath)

    // Save document to storage
    const metadata = await saveDocument(
      fileBuffer,
      uploadedFile.originalFilename || 'document',
      uploadedFile.mimetype || 'application/octet-stream',
      user.id
    )

    // Clean up temporary file created by formidable
    try {
      await fs.unlink(uploadedFile.filepath)
    } catch {
      // Ignore cleanup errors
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'File uploaded successfully',
        data: {
          documentId: metadata.documentId,
          documentUrl: metadata.documentUrl,
          originalFilename: metadata.originalFilename,
          fileSize: metadata.fileSize,
          fileSizeMB: validation.fileSizeMB,
          fileType: validation.fileType,
          uploadedAt: metadata.uploadedAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Upload error:', error)

    return NextResponse.json(
      {
        error: 'Failed to upload document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ocr/upload
 * Return API information
 */
export async function GET() {
  return NextResponse.json(
    {
      endpoint: '/api/ocr/upload',
      method: 'POST',
      description: 'Upload bill of lading document for OCR processing',
      contentType: 'multipart/form-data',
      parameters: {
        file: 'File to upload (PDF, JPG, PNG, TIFF)',
      },
      maxFileSize: `${process.env.MAX_FILE_SIZE_MB || '10'}MB`,
      supportedTypes: ['PDF', 'JPG', 'JPEG', 'PNG', 'TIFF'],
    },
    { status: 200 }
  )
}
