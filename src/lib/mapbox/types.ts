/**
 * Mapbox TypeScript Types
 * Type definitions for map components and data structures
 */

import type { LngLatLike, Map as MapboxMap, Marker, Popup } from 'mapbox-gl'

/**
 * Map coordinates
 */
export interface MapCoordinates {
  lng: number
  lat: number
}

/**
 * Map bounds
 */
export interface MapBounds {
  sw: MapCoordinates // Southwest corner
  ne: MapCoordinates // Northeast corner
}

/**
 * Vessel marker data
 */
export interface VesselMarkerData {
  id: string
  vesselId: string
  vesselName: string
  imoNumber: string
  mmsi?: string
  position: MapCoordinates
  status: VesselStatus
  heading?: number
  speed?: number
  eta?: string
  destination?: string
}

/**
 * Vessel status enum
 */
export type VesselStatus =
  | 'IN_TRANSIT'
  | 'AT_BERTH'
  | 'ANCHORED'
  | 'SCHEDULED'
  | 'HIGH_RISK'
  | 'DELAYED'

/**
 * Port marker data
 */
export interface PortMarkerData {
  id: string
  portId: string
  portName: string
  portCode: string
  position: MapCoordinates
  country: string
  city?: string
}

/**
 * Route data for vessel tracking
 */
export interface RouteData {
  id: string
  vesselId: string
  coordinates: MapCoordinates[]
  type: 'active' | 'completed' | 'planned'
  startPort?: PortMarkerData
  endPort?: PortMarkerData
}

/**
 * Map marker instance with metadata
 */
export interface MapMarkerInstance {
  marker: Marker
  popup?: Popup
  data: VesselMarkerData | PortMarkerData
  type: 'vessel' | 'port'
}

/**
 * Map layer configuration
 */
export interface MapLayerConfig {
  id: string
  type: 'symbol' | 'line' | 'circle' | 'fill'
  source: string
  layout?: Record<string, unknown>
  paint?: Record<string, unknown>
}

/**
 * Map source configuration
 */
export interface MapSourceConfig {
  id: string
  type: 'geojson' | 'vector' | 'raster'
  data?: unknown
  url?: string
}

/**
 * Geofence zone
 */
export interface GeofenceZone {
  id: string
  name: string
  type: 'port' | 'territorial_waters' | 'custom'
  coordinates: MapCoordinates[]
  radius?: number // in kilometers
}

/**
 * Map event handlers
 */
export interface MapEventHandlers {
  onMarkerClick?: (data: VesselMarkerData | PortMarkerData) => void
  onMapClick?: (coordinates: MapCoordinates) => void
  onMapMove?: (center: MapCoordinates, zoom: number) => void
  onBoundsChange?: (bounds: MapBounds) => void
}

/**
 * Map component props
 */
export interface MapComponentProps {
  vessels?: VesselMarkerData[]
  ports?: PortMarkerData[]
  routes?: RouteData[]
  selectedVesselId?: string | null
  selectedPortId?: string | null
  showClustering?: boolean
  showRoutes?: boolean
  showGeofences?: boolean
  geofences?: GeofenceZone[]
  eventHandlers?: MapEventHandlers
  className?: string
  initialCenter?: MapCoordinates
  initialZoom?: number
  style?: keyof typeof import('./config').MAPBOX_CONFIG.styles
}

/**
 * Vessel position update (for real-time tracking)
 */
export interface VesselPositionUpdate {
  vesselId: string
  position: MapCoordinates
  heading?: number
  speed?: number
  course?: number
  timestamp: string
}

/**
 * Map animation options
 */
export interface MapAnimationOptions {
  duration?: number
  easing?: (t: number) => number
  padding?: number
}

/**
 * Convert coordinates to Mapbox LngLatLike format
 */
export function toMapboxCoordinates(coords: MapCoordinates): LngLatLike {
  return [coords.lng, coords.lat]
}

/**
 * Convert Mapbox LngLat to MapCoordinates
 */
export function fromMapboxCoordinates(lngLat: { lng: number; lat: number }): MapCoordinates {
  return {
    lng: lngLat.lng,
    lat: lngLat.lat,
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(coord1: MapCoordinates, coord2: MapCoordinates): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat)
  const dLng = toRadians(coord2.lng - coord1.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
      Math.cos(toRadians(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}
