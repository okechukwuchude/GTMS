/**
 * OCR Processing API Route
 * POST /api/ocr/process
 * Process uploaded document with Google Cloud Vision API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDocument, deleteDocument } from '@/lib/utils/document-storage'
import { detectTextFromBuffer } from '@/lib/ocr/vision-client'
import { extractAllFields } from '@/lib/ocr/field-extractors'
import { calculateOverallConfidence } from '@/lib/ocr/confidence-calculator'
import { OCRResult } from '@/lib/ocr/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // OCR processing can take up to 60 seconds

/**
 * POST /api/ocr/process
 * Process document and extract fields using OCR
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log('[OCR] Starting OCR processing...')

    // Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[OCR] Authentication failed:', authError)
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    console.log('[OCR] User authenticated:', user.id)

    // Parse request body
    const body = await request.json()
    const { documentId } = body

    console.log('[OCR] Document ID:', documentId)

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Retrieve document from storage
    console.log('[OCR] Retrieving document from storage...')
    let documentData
    try {
      documentData = await getDocument(documentId)
      console.log('[OCR] Document retrieved, size:', documentData.buffer.length, 'bytes')
    } catch (error) {
      console.error('[OCR] Document retrieval error:', error)
      return NextResponse.json(
        { error: 'Document not found or could not be retrieved' },
        { status: 404 }
      )
    }

    // Call Google Cloud Vision API to extract text
    console.log('[OCR] Calling Vision API...')
    let visionResponse
    try {
      visionResponse = await detectTextFromBuffer(
        documentData.buffer,
        documentData.metadata.mimeType
      )
      console.log('[OCR] Vision API response received, text length:', visionResponse.fullText.length)
    } catch (error) {
      console.error('[OCR] Vision API error:', error)

      // Clean up document after failed processing
      await deleteDocument(documentId).catch(() => {})

      return NextResponse.json(
        {
          error: 'OCR processing failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

    // Extract fields from OCR text
    const extractedFields = extractAllFields(
      visionResponse.fullText,
      visionResponse.confidence
    )

    // Port codes are kept as-is (no UUID conversion needed)

    // Calculate overall confidence
    const overallConfidence = calculateOverallConfidence(extractedFields)

    // Clean up document after successful processing
    await deleteDocument(documentId).catch((err) => {
      console.warn('Failed to delete document after processing:', err)
    })

    // Build OCR result
    const ocrResult: OCRResult = {
      documentId,
      fields: extractedFields,
      overallConfidence,
      rawText: visionResponse.fullText,
      processedAt: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'OCR processing complete',
        data: ocrResult,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('OCR processing error:', error)

    return NextResponse.json(
      {
        error: 'Failed to process document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ocr/process
 * Return API information
 */
export async function GET() {
  return NextResponse.json(
    {
      endpoint: '/api/ocr/process',
      method: 'POST',
      description: 'Process uploaded document with OCR and extract fields',
      parameters: {
        documentId: 'Document ID from upload endpoint',
      },
      returns: {
        documentId: 'string',
        fields: 'Object with 26 extracted fields',
        overallConfidence: 'number (0-100)',
        rawText: 'string',
        processedAt: 'ISO timestamp',
        processingTimeMs: 'number',
      },
      timeout: '60 seconds',
    },
    { status: 200 }
  )
}
