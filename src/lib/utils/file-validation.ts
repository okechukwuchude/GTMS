/**
 * File Validation Utility
 * Validates uploaded files for OCR processing
 */

import { SupportedFileType } from '@/lib/ocr/types'

/**
 * Supported MIME types for OCR document upload
 */
export const SUPPORTED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/tiff': 'tiff',
  'image/tif': 'tiff',
} as const

/**
 * Maximum file size in bytes (default 10MB)
 */
export const MAX_FILE_SIZE_BYTES =
  (parseInt(process.env.MAX_FILE_SIZE_MB || '10') || 10) * 1024 * 1024

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean
  error?: string
  fileType?: SupportedFileType
  fileSizeMB?: number
}

/**
 * Validate file type based on MIME type
 * @param mimeType - MIME type of the uploaded file
 * @returns Validation result with file type or error
 */
export function validateFileType(mimeType: string): {
  valid: boolean
  error?: string
  fileType?: SupportedFileType
} {
  const normalizedMimeType = mimeType.toLowerCase().trim()

  if (!(normalizedMimeType in SUPPORTED_MIME_TYPES)) {
    return {
      valid: false,
      error: `Unsupported file type: ${mimeType}. Supported types: PDF, JPG, PNG, TIFF`,
    }
  }

  return {
    valid: true,
    fileType:
      SUPPORTED_MIME_TYPES[
        normalizedMimeType as keyof typeof SUPPORTED_MIME_TYPES
      ],
  }
}

/**
 * Validate file size
 * @param fileSize - Size of file in bytes
 * @param maxSizeMB - Maximum allowed size in MB (optional, defaults to MAX_FILE_SIZE_BYTES)
 * @returns Validation result with size info or error
 */
export function validateFileSize(
  fileSize: number,
  maxSizeMB?: number
): {
  valid: boolean
  error?: string
  fileSizeMB: number
} {
  const fileSizeMB = fileSize / (1024 * 1024)
  const maxBytes = maxSizeMB
    ? maxSizeMB * 1024 * 1024
    : MAX_FILE_SIZE_BYTES

  if (fileSize > maxBytes) {
    return {
      valid: false,
      error: `File too large: ${fileSizeMB.toFixed(2)}MB. Maximum allowed: ${(maxBytes / (1024 * 1024)).toFixed(0)}MB`,
      fileSizeMB,
    }
  }

  if (fileSize === 0) {
    return {
      valid: false,
      error: 'File is empty (0 bytes)',
      fileSizeMB: 0,
    }
  }

  return {
    valid: true,
    fileSizeMB,
  }
}

/**
 * Sanitize filename to prevent directory traversal and injection attacks
 * @param filename - Original filename
 * @returns Sanitized filename safe for filesystem storage
 */
export function sanitizeFileName(filename: string): string {
  // Remove directory separators and null bytes
  let sanitized = filename.replace(/[\/\\:\0]/g, '_')

  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, '')

  // Replace multiple spaces/underscores with single underscore
  sanitized = sanitized.replace(/[\s_]+/g, '_')

  // Remove any remaining dangerous characters
  sanitized = sanitized.replace(/[^\w\-\.]/g, '')

  // Ensure filename isn't empty after sanitization
  if (!sanitized || sanitized === '_') {
    sanitized = 'document'
  }

  // Limit length (preserve extension)
  const maxLength = 200
  if (sanitized.length > maxLength) {
    const extension = getFileExtension(sanitized)
    const nameWithoutExt = sanitized.substring(
      0,
      sanitized.length - extension.length - 1
    )
    sanitized = nameWithoutExt.substring(0, maxLength - extension.length - 1) + '.' + extension
  }

  return sanitized
}

/**
 * Extract file extension from filename
 * @param filename - Filename with extension
 * @returns File extension (lowercase, without dot)
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  if (parts.length < 2) {
    return ''
  }
  return parts[parts.length - 1].toLowerCase()
}

/**
 * Validate entire file (combines type and size validation)
 * @param file - File object with mimetype and size
 * @param maxSizeMB - Optional max size override
 * @returns Complete validation result
 */
export function validateFile(
  file: { mimetype: string; size: number; originalFilename?: string },
  maxSizeMB?: number
): FileValidationResult {
  // Validate file type
  const typeValidation = validateFileType(file.mimetype)
  if (!typeValidation.valid) {
    return {
      valid: false,
      error: typeValidation.error,
    }
  }

  // Validate file size
  const sizeValidation = validateFileSize(file.size, maxSizeMB)
  if (!sizeValidation.valid) {
    return {
      valid: false,
      error: sizeValidation.error,
      fileSizeMB: sizeValidation.fileSizeMB,
    }
  }

  return {
    valid: true,
    fileType: typeValidation.fileType,
    fileSizeMB: sizeValidation.fileSizeMB,
  }
}

/**
 * Generate unique filename for storage
 * @param originalFilename - Original filename from upload
 * @param prefix - Optional prefix (e.g., user ID)
 * @returns Unique filename with timestamp
 */
export function generateUniqueFilename(
  originalFilename: string,
  prefix?: string
): string {
  const sanitized = sanitizeFileName(originalFilename)
  const extension = getFileExtension(sanitized)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)

  const baseName = prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`

  return extension ? `${baseName}.${extension}` : baseName
}
