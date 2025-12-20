/**
 * Mapbox Configuration
 * Central configuration for Mapbox GL JS integration
 */

export const MAPBOX_CONFIG = {
  // Access token from environment variables
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',

  // Default map settings
  defaultCenter: {
    lng: 4.47917, // Rotterdam, Netherlands (major European port)
    lat: 51.9225,
  },

  defaultZoom: 10,

  // Map style URLs
  styles: {
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    navigation: 'mapbox://styles/mapbox/navigation-day-v1',
    navigationNight: 'mapbox://styles/mapbox/navigation-night-v1',
  },

  // Default style
  defaultStyle: 'mapbox://styles/mapbox/streets-v12',

  // Vessel marker colors by status
  vesselColors: {
    IN_TRANSIT: '#3B82F6', // Blue
    AT_BERTH: '#10B981', // Green
    ANCHORED: '#F59E0B', // Orange
    SCHEDULED: '#6B7280', // Gray
    HIGH_RISK: '#EF4444', // Red
    DELAYED: '#F59E0B', // Orange
  },

  // Port marker color
  portColor: '#0066FF', // Primary blue

  // Route line colors
  routeColors: {
    active: '#3B82F6', // Blue
    completed: '#10B981', // Green
    planned: '#9CA3AF', // Gray
  },

  // Animation settings
  animation: {
    duration: 1000, // milliseconds
    vesselMovement: 3000, // milliseconds for vessel position updates
  },

  // Cluster settings
  clusterRadius: 50,
  clusterMaxZoom: 14,

  // Geofence settings
  geofence: {
    portRadius: 5, // km
    territorialWaters: 12, // nautical miles
  },
} as const

/**
 * Validate Mapbox configuration
 * Ensures token is available
 */
export function validateMapboxConfig() {
  if (!MAPBOX_CONFIG.accessToken) {
    throw new Error(
      'Mapbox access token is missing. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables.'
    )
  }
  return true
}

/**
 * Get map style URL
 */
export function getMapStyle(style: keyof typeof MAPBOX_CONFIG.styles = 'streets') {
  return MAPBOX_CONFIG.styles[style] || MAPBOX_CONFIG.defaultStyle
}

/**
 * Get vessel marker color by status
 */
export function getVesselColor(status: string): string {
  return (
    MAPBOX_CONFIG.vesselColors[status as keyof typeof MAPBOX_CONFIG.vesselColors] ||
    MAPBOX_CONFIG.vesselColors.IN_TRANSIT
  )
}
