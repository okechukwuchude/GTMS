/**
 * Mapbox Utility Functions
 * Helper functions for map operations
 */

import type { Map as MapboxMap } from 'mapbox-gl'
import type {
  MapCoordinates,
  MapBounds,
  VesselMarkerData,
  PortMarkerData,
} from './types'

/**
 * Fit map to bounds with padding
 */
export function fitMapToBounds(
  map: MapboxMap,
  bounds: MapBounds,
  padding: number = 50
): void {
  map.fitBounds(
    [
      [bounds.sw.lng, bounds.sw.lat],
      [bounds.ne.lng, bounds.ne.lat],
    ],
    { padding }
  )
}

/**
 * Calculate bounds from array of coordinates
 */
export function calculateBounds(coordinates: MapCoordinates[]): MapBounds | null {
  if (coordinates.length === 0) return null

  const lngs = coordinates.map((c) => c.lng)
  const lats = coordinates.map((c) => c.lat)

  return {
    sw: {
      lng: Math.min(...lngs),
      lat: Math.min(...lats),
    },
    ne: {
      lng: Math.max(...lngs),
      lat: Math.max(...lats),
    },
  }
}

/**
 * Calculate bounds from vessels and ports
 */
export function calculateMapBounds(
  vessels: VesselMarkerData[],
  ports: PortMarkerData[]
): MapBounds | null {
  const coordinates = [
    ...vessels.map((v) => v.position),
    ...ports.map((p) => p.position),
  ]
  return calculateBounds(coordinates)
}

/**
 * Fly to coordinates with smooth animation
 */
export function flyToCoordinates(
  map: MapboxMap,
  coordinates: MapCoordinates,
  zoom?: number,
  duration: number = 1000
): void {
  map.flyTo({
    center: [coordinates.lng, coordinates.lat],
    zoom: zoom || map.getZoom(),
    duration,
  })
}

/**
 * Create popup HTML for vessel marker
 */
export function createVesselPopupHTML(vessel: VesselMarkerData): string {
  return `
    <div class="vessel-popup">
      <h3 class="font-semibold text-sm mb-1">${vessel.vesselName}</h3>
      <p class="text-xs text-gray-600">IMO: ${vessel.imoNumber}</p>
      <p class="text-xs text-gray-600">Status: ${vessel.status.replace('_', ' ')}</p>
      ${vessel.speed ? `<p class="text-xs text-gray-600">Speed: ${vessel.speed.toFixed(1)} knots</p>` : ''}
      ${vessel.destination ? `<p class="text-xs text-gray-600">To: ${vessel.destination}</p>` : ''}
      ${vessel.eta ? `<p class="text-xs text-gray-600">ETA: ${new Date(vessel.eta).toLocaleDateString()}</p>` : ''}
    </div>
  `
}

/**
 * Create popup HTML for port marker
 */
export function createPortPopupHTML(port: PortMarkerData): string {
  return `
    <div class="port-popup">
      <h3 class="font-semibold text-sm mb-1">${port.portName}</h3>
      <p class="text-xs text-gray-600">Code: ${port.portCode}</p>
      <p class="text-xs text-gray-600">${port.city ? `${port.city}, ` : ''}${port.country}</p>
    </div>
  `
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(coords: MapCoordinates, decimals: number = 4): string {
  const lat = Math.abs(coords.lat).toFixed(decimals)
  const lng = Math.abs(coords.lng).toFixed(decimals)
  const latDir = coords.lat >= 0 ? 'N' : 'S'
  const lngDir = coords.lng >= 0 ? 'E' : 'W'
  return `${lat}° ${latDir}, ${lng}° ${lngDir}`
}

/**
 * Convert knots to km/h
 */
export function knotsToKmh(knots: number): number {
  return knots * 1.852
}

/**
 * Convert km to nautical miles
 */
export function kmToNauticalMiles(km: number): number {
  return km / 1.852
}

/**
 * Calculate bearing between two coordinates
 */
export function calculateBearing(from: MapCoordinates, to: MapCoordinates): number {
  const lat1 = toRadians(from.lat)
  const lat2 = toRadians(to.lat)
  const dLng = toRadians(to.lng - from.lng)

  const y = Math.sin(dLng) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)

  const bearing = Math.atan2(y, x)
  return (toDegrees(bearing) + 360) % 360
}

/**
 * Calculate ETA based on distance and speed
 * Returns ISO date string
 */
export function calculateETA(
  distance: number, // in km
  speedKnots: number
): string {
  const speedKmh = knotsToKmh(speedKnots)
  const hoursToArrival = distance / speedKmh
  const arrivalTime = new Date(Date.now() + hoursToArrival * 60 * 60 * 1000)
  return arrivalTime.toISOString()
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * Check if coordinates are within bounds
 */
export function isWithinBounds(coords: MapCoordinates, bounds: MapBounds): boolean {
  return (
    coords.lng >= bounds.sw.lng &&
    coords.lng <= bounds.ne.lng &&
    coords.lat >= bounds.sw.lat &&
    coords.lat <= bounds.ne.lat
  )
}

/**
 * Generate marker ID
 */
export function generateMarkerId(type: 'vessel' | 'port', id: string): string {
  return `${type}-marker-${id}`
}
