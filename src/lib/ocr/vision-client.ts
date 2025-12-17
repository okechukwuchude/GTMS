/**
 * Google Cloud Vision API Client
 * Wrapper for Vision API text detection
 */

import vision from '@google-cloud/vision'
import { VisionAPIResponse } from './types'

/**
 * Initialize Google Cloud Vision client
 * Handles both local development (file path) and production (JSON from env var)
 */
function getVisionClient() {
  // Production: Use base64-encoded JSON from environment variable
  if (process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON) {
    const base64Json = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON
    const jsonString = Buffer.from(base64Json, 'base64').toString('utf-8')
    const credentials = JSON.parse(jsonString)

    return new vision.ImageAnnotatorClient({
      credentials,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    })
  }

  // Local Development: Use file path from GOOGLE_APPLICATION_CREDENTIALS
  // The @google-cloud/vision library will automatically use this env var
  return new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  })
}

/**
 * Detect text in a document using Google Cloud Vision API
 * @param filePath - Path to the document file (PDF, JPG, PNG, TIFF)
 * @returns Vision API response with detected text
 */
export async function detectText(filePath: string): Promise<VisionAPIResponse> {
  try {
    const client = getVisionClient()

    // Use documentTextDetection for structured documents (better for BOL)
    const [result] = await client.documentTextDetection(filePath)

    if (!result.fullTextAnnotation) {
      throw new Error('No text detected in document')
    }

    return {
      fullText: result.fullTextAnnotation.text || '',
      pages: result.fullTextAnnotation.pages || [],
      confidence: calculateAverageConfidence(result.fullTextAnnotation),
      textAnnotations: result.textAnnotations || [],
      raw: result,
    }
  } catch (error) {
    console.error('Vision API error:', error)

    if (error instanceof Error) {
      // Handle specific Vision API errors
      if (error.message.includes('quota')) {
        throw new Error('Vision API quota exceeded. Please try again later.')
      }
      if (error.message.includes('permission')) {
        throw new Error(
          'Vision API permission denied. Check service account permissions.'
        )
      }
      if (error.message.includes('API has not been enabled')) {
        throw new Error(
          'Cloud Vision API is not enabled. Please enable it in Google Cloud Console.'
        )
      }
    }

    throw error
  }
}

/**
 * Detect text in a document from buffer
 * @param buffer - Document file buffer
 * @param mimeType - MIME type of the document
 * @returns Vision API response with detected text
 */
export async function detectTextFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<VisionAPIResponse> {
  try {
    const client = getVisionClient()

    // Prepare image request
    const request = {
      image: {
        content: buffer.toString('base64'),
      },
    }

    // Use documentTextDetection for structured documents
    const [result] = await client.documentTextDetection(request)

    if (!result.fullTextAnnotation) {
      throw new Error('No text detected in document')
    }

    return {
      fullText: result.fullTextAnnotation.text || '',
      pages: result.fullTextAnnotation.pages || [],
      confidence: calculateAverageConfidence(result.fullTextAnnotation),
      textAnnotations: result.textAnnotations || [],
      raw: result,
    }
  } catch (error) {
    console.error('Vision API error (buffer):', error)

    if (error instanceof Error) {
      // Handle specific Vision API errors
      if (error.message.includes('quota')) {
        throw new Error('Vision API quota exceeded. Please try again later.')
      }
      if (error.message.includes('permission')) {
        throw new Error(
          'Vision API permission denied. Check service account permissions.'
        )
      }
    }

    throw error
  }
}

/**
 * Calculate average confidence from Vision API response
 * @param annotation - Full text annotation from Vision API
 * @returns Average confidence score (0-1)
 */
function calculateAverageConfidence(annotation: any): number {
  if (!annotation.pages || annotation.pages.length === 0) {
    return 0
  }

  let totalConfidence = 0
  let wordCount = 0

  for (const page of annotation.pages) {
    if (!page.blocks) continue

    for (const block of page.blocks) {
      if (!block.paragraphs) continue

      for (const paragraph of block.paragraphs) {
        if (!paragraph.words) continue

        for (const word of paragraph.words) {
          if (word.confidence !== null && word.confidence !== undefined) {
            totalConfidence += word.confidence
            wordCount++
          }
        }
      }
    }
  }

  return wordCount > 0 ? totalConfidence / wordCount : 0
}
