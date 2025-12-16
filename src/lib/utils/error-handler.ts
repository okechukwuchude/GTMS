/**
 * Centralized error handling utilities
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Handle API response errors with user-friendly messages
 */
export async function handleApiError(response: Response): Promise<never> {
  let errorMessage = 'An unexpected error occurred'
  let errorCode: string | undefined
  let parsedError: any = null

  try {
    parsedError = await response.json()
    errorMessage = parsedError.error || parsedError.message || errorMessage
    errorCode = parsedError.code
  } catch {
    // If response doesn't have JSON, use status text
    errorMessage = response.statusText || errorMessage
  }

  // Handle specific HTTP status codes
  switch (response.status) {
    case 401:
      // Unauthorized - session expired or not authenticated
      errorMessage = 'Your session has expired. Please log in again.'
      errorCode = 'SESSION_EXPIRED'
      // Optionally redirect to login
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      }
      break

    case 403:
      // Forbidden - RLS policy blocking access
      errorMessage =
        'You do not have permission to access this resource. This may belong to another user.'
      errorCode = 'FORBIDDEN'
      break

    case 404:
      // Not found
      errorMessage = 'The requested resource was not found.'
      errorCode = 'NOT_FOUND'
      break

    case 409:
      // Conflict - duplicate or constraint violation
      errorMessage = parsedError?.error || 'This operation conflicts with existing data.'
      errorCode = 'CONFLICT'
      break

    case 422:
      // Validation error
      errorMessage = parsedError?.error || 'The provided data is invalid.'
      errorCode = 'VALIDATION_ERROR'
      break

    case 500:
    case 502:
    case 503:
      // Server errors
      errorMessage = 'Server error. Please try again later.'
      errorCode = 'SERVER_ERROR'
      break

    default:
      // Use the error message from response if available
      break
  }

  throw new ApiError(response.status, errorMessage, errorCode)
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry on client errors (4xx) or auth issues
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break
      }

      // Wait with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }
  return false
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    // Check for network errors
    if (isNetworkError(error)) {
      return 'Network error. Please check your connection and try again.'
    }
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred'
}

/**
 * Log error for debugging (in development)
 */
export function logError(error: unknown, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.error(
      `[Error${context ? ` - ${context}` : ''}]:`,
      error instanceof Error ? error : new Error(String(error))
    )
  }
}
