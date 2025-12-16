/**
 * Format a number with thousand separators
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string (e.g., "1,234" or "1,234.56")
 */
export function formatNumber(num: number | null | undefined, decimals: number = 0): string {
  if (num === null || num === undefined || isNaN(num)) return '-'

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format a number as currency
 * @param value - Numeric value
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string (e.g., "$1,234.00")
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = 'USD'
): string {
  if (value === null || value === undefined || isNaN(value)) return '-'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format a number with unit (e.g., weight, volume)
 * @param value - Numeric value
 * @param unit - Unit string (e.g., 'kg', 'cbm', 'ft')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with unit (e.g., "1,234.56 kg")
 */
export function formatNumberWithUnit(
  value: number | null | undefined,
  unit: string,
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) return '-'

  const formattedNumber = formatNumber(value, decimals)
  return `${formattedNumber} ${unit}`
}

/**
 * Format a percentage
 * @param value - Decimal value (e.g., 0.15 for 15%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "15.0%")
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined || isNaN(value)) return '-'

  return `${formatNumber(value * 100, decimals)}%`
}
