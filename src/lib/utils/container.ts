/**
 * ISO 6346 container number validation and formatting utilities
 * Container number format: 4 letters + 7 digits (last digit is check digit)
 * Example: MSCU1234567
 */

/**
 * Calculate ISO 6346 check digit for a container number
 * @param ownerCode - 3-letter owner code (e.g., 'MSC')
 * @param equipmentCategoryId - 1-letter equipment category (usually 'U')
 * @param serialNumber - 6-digit serial number
 * @returns Check digit (0-9)
 */
function calculateCheckDigit(
  ownerCode: string,
  equipmentCategoryId: string,
  serialNumber: string
): number {
  const containerCode = (ownerCode + equipmentCategoryId + serialNumber).toUpperCase()

  // ISO 6346 character value mapping
  const charValues: { [key: string]: number } = {
    A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19, J: 20,
    K: 21, L: 23, M: 24, N: 25, O: 26, P: 27, Q: 28, R: 29, S: 30, T: 31,
    U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38,
  }

  let sum = 0

  // Calculate weighted sum for first 10 characters
  for (let i = 0; i < 10; i++) {
    const char = containerCode[i]
    const value = char.match(/[A-Z]/) ? charValues[char] : parseInt(char, 10)
    sum += value * Math.pow(2, i)
  }

  // Check digit is the remainder of sum divided by 11, modulo 10
  const checkDigit = (sum % 11) % 10

  return checkDigit
}

/**
 * Validate a container number against ISO 6346 standard
 * @param containerNumber - Container number to validate
 * @returns True if valid, false otherwise
 */
export function validateContainerNumber(containerNumber: string): boolean {
  if (!containerNumber) return false

  // Remove spaces and convert to uppercase
  const cleaned = containerNumber.replace(/\s/g, '').toUpperCase()

  // Check format: 4 letters + 7 digits
  const regex = /^[A-Z]{4}\d{7}$/
  if (!regex.test(cleaned)) return false

  // Extract components
  const ownerCode = cleaned.substring(0, 3)
  const equipmentCategoryId = cleaned.substring(3, 4)
  const serialNumber = cleaned.substring(4, 10)
  const providedCheckDigit = parseInt(cleaned.substring(10, 11), 10)

  // Calculate expected check digit
  const calculatedCheckDigit = calculateCheckDigit(ownerCode, equipmentCategoryId, serialNumber)

  // Validate check digit
  return calculatedCheckDigit === providedCheckDigit
}

/**
 * Format a container number for display (adds space before check digit)
 * @param containerNumber - Container number to format
 * @returns Formatted container number (e.g., "MSCU123456 7")
 */
export function formatContainerNumber(containerNumber: string): string {
  if (!containerNumber) return ''

  // Remove spaces and convert to uppercase
  const cleaned = containerNumber.replace(/\s/g, '').toUpperCase()

  // Check if it matches the expected format
  if (cleaned.length === 11 && /^[A-Z]{4}\d{7}$/.test(cleaned)) {
    // Add space before check digit for readability
    return `${cleaned.substring(0, 10)} ${cleaned.substring(10)}`
  }

  // Return as-is if format doesn't match
  return containerNumber.toUpperCase()
}

/**
 * Generate a validation message for a container number
 * @param containerNumber - Container number to validate
 * @returns Validation message (empty string if valid)
 */
export function getContainerNumberValidationMessage(containerNumber: string): string {
  if (!containerNumber) {
    return 'Container number is required'
  }

  const cleaned = containerNumber.replace(/\s/g, '').toUpperCase()

  if (!/^[A-Z]{4}\d{7}$/.test(cleaned)) {
    return 'Container number must be 4 letters followed by 7 digits (e.g., MSCU1234567)'
  }

  if (!validateContainerNumber(cleaned)) {
    return 'Invalid container number check digit'
  }

  return ''
}

/**
 * Parse container number components
 * @param containerNumber - Container number to parse
 * @returns Object with owner code, equipment category, serial number, and check digit
 */
export function parseContainerNumber(containerNumber: string): {
  ownerCode: string
  equipmentCategoryId: string
  serialNumber: string
  checkDigit: string
  isValid: boolean
} | null {
  if (!containerNumber) return null

  const cleaned = containerNumber.replace(/\s/g, '').toUpperCase()

  if (!/^[A-Z]{4}\d{7}$/.test(cleaned)) return null

  return {
    ownerCode: cleaned.substring(0, 3),
    equipmentCategoryId: cleaned.substring(3, 4),
    serialNumber: cleaned.substring(4, 10),
    checkDigit: cleaned.substring(10, 11),
    isValid: validateContainerNumber(cleaned),
  }
}
