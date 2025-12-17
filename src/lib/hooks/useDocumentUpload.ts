/**
 * Document Upload Hook
 * React Query hook for uploading and processing documents with OCR
 */

import { useMutation } from '@tanstack/react-query'
import { OCRResult } from '@/lib/ocr/types'

/**
 * Upload response from /api/ocr/upload
 */
interface UploadResponse {
  success: boolean
  message: string
  data: {
    documentId: string
    documentUrl: string
    originalFilename: string
    fileSize: number
    fileSizeMB: number
    fileType: string
    uploadedAt: string
  }
}

/**
 * OCR processing response from /api/ocr/process
 */
interface ProcessResponse {
  success: boolean
  message: string
  data: OCRResult
}

/**
 * Error response from API
 */
interface ErrorResponse {
  error: string
  details?: string
}

/**
 * Upload a document to the server
 */
async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/ocr/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error: ErrorResponse = await response.json()
    throw new Error(error.error || 'Upload failed')
  }

  return response.json()
}

/**
 * Process uploaded document with OCR
 */
async function processDocument(documentId: string): Promise<ProcessResponse> {
  const response = await fetch('/api/ocr/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documentId }),
  })

  if (!response.ok) {
    const error: ErrorResponse = await response.json()
    throw new Error(error.error || 'OCR processing failed')
  }

  return response.json()
}

/**
 * Upload and process a document (combined operation)
 */
async function uploadAndProcess(file: File): Promise<OCRResult> {
  // Step 1: Upload document
  const uploadResult = await uploadDocument(file)

  // Step 2: Process with OCR
  const processResult = await processDocument(uploadResult.data.documentId)

  return processResult.data
}

/**
 * Hook for uploading documents and processing with OCR
 *
 * @example
 * ```tsx
 * const { mutate: uploadDocument, isPending, isSuccess } = useDocumentUpload({
 *   onSuccess: (ocrResult) => {
 *     console.log('OCR complete:', ocrResult)
 *     // Pre-fill form with ocrResult.fields
 *   },
 *   onError: (error) => {
 *     console.error('Upload failed:', error)
 *   }
 * })
 *
 * // In your component
 * <input type="file" onChange={(e) => {
 *   if (e.target.files?.[0]) {
 *     uploadDocument(e.target.files[0])
 *   }
 * }} />
 * ```
 */
export function useDocumentUpload(options?: {
  onSuccess?: (data: OCRResult) => void
  onError?: (error: Error) => void
}) {
  return useMutation({
    mutationFn: uploadAndProcess,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  })
}

/**
 * Hook for just uploading (without OCR processing)
 * Use this if you want to separate upload and processing steps
 */
export function useDocumentUploadOnly(options?: {
  onSuccess?: (data: UploadResponse['data']) => void
  onError?: (error: Error) => void
}) {
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: (response) => options?.onSuccess?.(response.data),
    onError: options?.onError,
  })
}

/**
 * Hook for just OCR processing (document already uploaded)
 */
export function useDocumentProcess(options?: {
  onSuccess?: (data: OCRResult) => void
  onError?: (error: Error) => void
}) {
  return useMutation({
    mutationFn: processDocument,
    onSuccess: (response) => options?.onSuccess?.(response.data),
    onError: options?.onError,
  })
}
