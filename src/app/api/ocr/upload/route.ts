/**
 * OCR Document Upload API Route
 * POST /api/ocr/upload
 * Accepts multipart/form-data with file upload
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateFile } from '@/lib/utils/file-validation'
import { saveDocument } from '@/lib/utils/document-storage'
import { createClient } from '@/lib/supabase/server'

// Disable Next.js body parsing for file uploads
export const dynamic = 'force-dynamic'

/**
 * POST /api/ocr/upload
 * Upload document for OCR processing
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Upload] Starting file upload...')

    // Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[Upload] Authentication failed')
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    console.log('[Upload] User authenticated:', user.id)

    // Parse form data using Next.js native formData()
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('[Upload] No file in form data')
      return NextResponse.json(
        { error: 'No file uploaded. Please select a file.' },
        { status: 400 }
      )
    }

    console.log('[Upload] File received:', file.name, file.type, file.size, 'bytes')

    // Validate file
    const validation = validateFile({
      mimetype: file.type,
      size: file.size,
      originalFilename: file.name,
    })

    if (!validation.valid) {
      console.log('[Upload] Validation failed:', validation.error)
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    console.log('[Upload] Validation passed')

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    console.log('[Upload] File converted to buffer, size:', fileBuffer.length)

    // Save document to storage
    const metadata = await saveDocument(
      fileBuffer,
      file.name,
      file.type,
      user.id
    )

    console.log('[Upload] Document saved:', metadata.documentId)

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
    console.error('[Upload] Upload error:', error)

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
