/**
 * Container-related constants
 * Centralized definitions for statuses, types, colors, and hazard classes
 */

/**
 * Container status definitions
 */
export const CONTAINER_STATUSES = [
  { value: 'registered', label: 'Registered', description: 'Container registered in system' },
  { value: 'in_transit', label: 'In Transit', description: 'Container is being shipped' },
  { value: 'arrived', label: 'Arrived', description: 'Container has arrived at destination port' },
  { value: 'pending_inspection', label: 'Pending Inspection', description: 'Awaiting inspection' },
  { value: 'under_inspection', label: 'Under Inspection', description: 'Currently being inspected' },
  { value: 'inspection_complete', label: 'Inspection Complete', description: 'Inspection finished' },
  { value: 'cleared', label: 'Cleared', description: 'Cleared for release' },
  { value: 'detained', label: 'Detained', description: 'Container detained by authorities' },
  { value: 'released', label: 'Released', description: 'Released to consignee' },
  { value: 'departed', label: 'Departed', description: 'Left the port facility' },
] as const

export type ContainerStatus = typeof CONTAINER_STATUSES[number]['value']

/**
 * Status color mapping for badges and UI elements
 * Maps container status to color variants
 */
export const STATUS_COLOR_MAP: Record<ContainerStatus, 'blue' | 'yellow' | 'green' | 'red' | 'gray'> = {
  registered: 'blue',
  in_transit: 'blue',
  arrived: 'blue',
  pending_inspection: 'yellow',
  under_inspection: 'yellow',
  inspection_complete: 'green',
  cleared: 'green',
  detained: 'red',
  released: 'green',
  departed: 'gray',
}

/**
 * Status badge style variants
 */
export const STATUS_BADGE_STYLES = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  gray: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
} as const

/**
 * Container type definitions
 */
export const CONTAINER_TYPES = [
  { value: '20FT', label: '20ft Standard', description: '20-foot standard container' },
  { value: '40FT', label: '40ft Standard', description: '40-foot standard container' },
  { value: '40FT_HC', label: '40ft High Cube', description: '40-foot high cube container' },
  { value: '45FT', label: '45ft High Cube', description: '45-foot high cube container' },
  { value: 'REEFER', label: 'Reefer', description: 'Refrigerated container' },
  { value: 'TANK', label: 'Tank', description: 'Tank container for liquids' },
  { value: 'OPEN_TOP', label: 'Open Top', description: 'Open top container' },
  { value: 'FLAT_RACK', label: 'Flat Rack', description: 'Flat rack container' },
] as const

export type ContainerType = typeof CONTAINER_TYPES[number]['value']

/**
 * Hazardous material classification (UN/IMO)
 */
export const HAZARD_CLASSES = [
  { value: '1', label: 'Class 1', description: 'Explosives' },
  { value: '2', label: 'Class 2', description: 'Gases (flammable, non-flammable, toxic)' },
  { value: '3', label: 'Class 3', description: 'Flammable liquids' },
  { value: '4.1', label: 'Class 4.1', description: 'Flammable solids' },
  { value: '4.2', label: 'Class 4.2', description: 'Spontaneously combustible' },
  { value: '4.3', label: 'Class 4.3', description: 'Dangerous when wet' },
  { value: '5.1', label: 'Class 5.1', description: 'Oxidizing substances' },
  { value: '5.2', label: 'Class 5.2', description: 'Organic peroxides' },
  { value: '6.1', label: 'Class 6.1', description: 'Toxic substances' },
  { value: '6.2', label: 'Class 6.2', description: 'Infectious substances' },
  { value: '7', label: 'Class 7', description: 'Radioactive material' },
  { value: '8', label: 'Class 8', description: 'Corrosive substances' },
  { value: '9', label: 'Class 9', description: 'Miscellaneous dangerous goods' },
] as const

export type HazardClass = typeof HAZARD_CLASSES[number]['value']

/**
 * Currency codes (ISO 4217)
 */
export const CURRENCY_CODES = [
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { value: 'JPY', label: 'JPY - Japanese Yen', symbol: '¥' },
  { value: 'CNY', label: 'CNY - Chinese Yuan', symbol: '¥' },
  { value: 'AED', label: 'AED - UAE Dirham', symbol: 'د.إ' },
  { value: 'SGD', label: 'SGD - Singapore Dollar', symbol: 'S$' },
] as const

export type CurrencyCode = typeof CURRENCY_CODES[number]['value']

/**
 * Quantity units
 */
export const QUANTITY_UNITS = [
  { value: 'pieces', label: 'Pieces' },
  { value: 'pallets', label: 'Pallets' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'cartons', label: 'Cartons' },
  { value: 'packages', label: 'Packages' },
  { value: 'units', label: 'Units' },
] as const

export type QuantityUnit = typeof QUANTITY_UNITS[number]['value']

/**
 * Risk level categories
 */
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS]

/**
 * Risk level color mapping
 */
export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: 'green',
  medium: 'yellow',
  high: 'red',
  critical: 'red',
}

/**
 * Pagination defaults
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const

/**
 * Date format patterns
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
} as const
