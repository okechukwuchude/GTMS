/**
 * Confidence Calculator
 * Calculate confidence scores for extracted fields
 */

import { OCRField } from './types'

/**
 * Calculate confidence score for a single field
 * @param field - Field name
 * @param extractedValue - Extracted value
 * @param visionConfidence - Vision API confidence (0-1)
 * @param validationPassed - Whether field passes validation
 * @param keywordFound - Whether field label/keyword was found nearby
 * @returns Confidence score 0-100
 */
export function calculateFieldConfidence(
  field: string,
  extractedValue: string | number | boolean | null,
  visionConfidence: number = 0,
  validationPassed: boolean = true,
  keywordFound: boolean = false
): number {
  // TODO: Sprint 3 - Implement confidence calculation
  // Factors:
  // 1. Vision API's built-in confidence score (0-1) → weight 40%
  // 2. Field type (structured vs free-text) → weight 20%
  // 3. Validation pass (does it match expected format?) → weight 25%
  // 4. Keyword proximity (was field label found nearby?) → weight 15%

  // Base confidence from Vision API
  let confidence = visionConfidence * 40

  // Field type scoring
  const structuredFields = [
    'container_number',
    'bill_of_lading',
    'quantity',
    'weight_kg',
  ]
  if (structuredFields.includes(field)) {
    confidence += 20 // Structured fields are more reliable
  } else {
    confidence += 10 // Free-text fields less reliable
  }

  // Validation scoring
  if (validationPassed) {
    confidence += 25
  } else {
    confidence += 0 // Failed validation = low confidence
  }

  // Keyword proximity scoring
  if (keywordFound) {
    confidence += 15
  } else {
    confidence += 5 // Still give some points even if keyword not found
  }

  // Ensure confidence is between 0-100
  return Math.min(100, Math.max(0, confidence))
}

/**
 * Calculate overall confidence score for all extracted fields
 * @param fields - Object containing all extracted fields
 * @returns Overall confidence score 0-100
 */
export function calculateOverallConfidence(
  fields: Record<string, OCRField | null | undefined>
): number {
  // TODO: Sprint 3 - Implement overall confidence
  // Average of all field confidences, weighted by field importance

  const fieldValues = Object.values(fields).filter(
    (f): f is OCRField => f !== null && f !== undefined
  )

  if (fieldValues.length === 0) {
    return 0
  }

  const totalConfidence = fieldValues.reduce(
    (sum, field) => sum + field.confidence,
    0
  )

  return Math.round(totalConfidence / fieldValues.length)
}

/**
 * Get confidence tier for a confidence score
 */
export function getConfidenceTier(
  confidence: number
): 'high' | 'medium' | 'low' | 'very-low' {
  if (confidence >= 95) return 'high' // Tier 1
  if (confidence >= 85) return 'high' // Tier 2
  if (confidence >= 75) return 'medium' // Tier 3
  if (confidence >= 60) return 'low' // Tier 4
  return 'very-low'
}

/**
 * Check if field should be auto-filled based on confidence
 */
export function shouldAutoFill(confidence: number): boolean {
  return confidence >= 60
}

/**
 * Check if field requires user review
 */
export function requiresReview(confidence: number): boolean {
  return confidence < 80
}
