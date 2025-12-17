/**
 * Google Cloud Vision API Client
 * Wrapper for Vision API text detection
 */

import { VisionAPIResponse } from './types'

// NOTE: This will be implemented in Sprint 3
// Google Cloud Vision client initialization will go here

/**
 * Initialize Google Cloud Vision client
 * Handles both local development (file path) and production (JSON from env var)
 */
function getVisionCredentials() {
  // Production: Use base64-encoded JSON from environment variable
  if (process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON) {
    const base64Json = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON
    const jsonString = Buffer.from(base64Json, 'base64').toString('utf-8')
    return JSON.parse(jsonString)
  }

  // Local Development: Use file path from GOOGLE_APPLICATION_CREDENTIALS
  // The @google-cloud/vision library will automatically use this env var
  return undefined // Let the library use the default credential resolution
}

/**
 * Detect text in a document using Google Cloud Vision API
 * @param filePath - Path to the document file (PDF, JPG, PNG, TIFF)
 * @returns Vision API response with detected text
 */
export async function detectText(filePath: string): Promise<VisionAPIResponse> {
  // TODO: Sprint 3 - Implement Vision API text detection
  // 1. Initialize Vision client with credentials
  // 2. Read file from filePath
  // 3. Call documentTextDetection (better for structured docs)
  // 4. Return raw Vision API response
  // 5. Handle API failures and rate limits

  throw new Error('Vision API not yet implemented - Sprint 3')
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
  // TODO: Sprint 3 - Implement buffer-based text detection
  throw new Error('Vision API not yet implemented - Sprint 3')
}
