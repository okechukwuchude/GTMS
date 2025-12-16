import { format, formatDistanceToNow } from 'date-fns'

/**
 * Format a date to a readable string
 * @param date - Date object, string, or timestamp
 * @param formatString - date-fns format string (default: 'MMM dd, yyyy')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  formatString: string = 'MMM dd, yyyy'
): string {
  if (!date) return '-'

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    return format(dateObj, formatString)
  } catch (error) {
    console.error('Error formatting date:', error)
    return '-'
  }
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "3 days ago")
 * @param date - Date object, string, or timestamp
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string | number): string {
  if (!date) return '-'

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true })
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return '-'
  }
}

/**
 * Format a date and time to a readable string
 * @param date - Date object, string, or timestamp
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string | number): string {
  return formatDate(date, 'MMM dd, yyyy HH:mm')
}

/**
 * Format a date for input fields (YYYY-MM-DD)
 * @param date - Date object, string, or timestamp
 * @returns Date string in ISO format
 */
export function formatDateForInput(date: Date | string | number): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    return format(dateObj, 'yyyy-MM-dd')
  } catch (error) {
    console.error('Error formatting date for input:', error)
    return ''
  }
}
