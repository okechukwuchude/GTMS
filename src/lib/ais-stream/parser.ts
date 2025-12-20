/**
 * AIS Stream Message Parsers
 * Converts raw AIS Stream messages to simplified application formats
 */

import type {
  AISStreamMessage,
  ParsedVesselPosition,
  ParsedVesselStatic,
} from './types'

/**
 * Parse Position Report message to simplified vessel position
 */
export function parsePositionReport(
  message: AISStreamMessage
): ParsedVesselPosition | null {
  try {
    const positionReport = message.Message.PositionReport
    const metadata = message.MetaData

    if (!positionReport || !metadata) {
      console.warn('[AIS Parser] Missing PositionReport or MetaData')
      return null
    }

    // MMSI is the primary identifier
    const mmsi = String(positionReport.UserID || metadata.MMSI)
    if (!mmsi) {
      console.warn('[AIS Parser] No MMSI found in position report')
      return null
    }

    // Position coordinates are required
    const latitude = positionReport.Latitude
    const longitude = positionReport.Longitude
    if (latitude === undefined || longitude === undefined) {
      console.warn('[AIS Parser] Missing position coordinates')
      return null
    }

    return {
      mmsi,
      vesselName: metadata.ShipName || null,
      latitude,
      longitude,
      speedKnots: positionReport.Sog ?? null, // Speed Over Ground
      courseOverGround: positionReport.Cog ?? null, // Course Over Ground
      heading: positionReport.TrueHeading ?? null,
      navigationStatus: positionReport.NavigationalStatus ?? null,
      timestamp: metadata.time_utc,
      rawMessage: message,
    }
  } catch (error) {
    console.error('[AIS Parser] Error parsing position report:', error)
    return null
  }
}

/**
 * Parse Ship Static Data message to simplified vessel static info
 */
export function parseShipStaticData(
  message: AISStreamMessage
): ParsedVesselStatic | null {
  try {
    const staticData = message.Message.ShipStaticData
    const metadata = message.MetaData

    if (!staticData || !metadata) {
      console.warn('[AIS Parser] Missing ShipStaticData or MetaData')
      return null
    }

    // MMSI is the primary identifier
    const mmsi = String(staticData.UserID || metadata.MMSI)
    if (!mmsi) {
      console.warn('[AIS Parser] No MMSI found in static data')
      return null
    }

    // Parse ETA if available
    let eta: Date | null = null
    if (staticData.Eta && staticData.Eta.Month && staticData.Eta.Day) {
      try {
        const currentYear = new Date().getFullYear()
        eta = new Date(
          currentYear,
          staticData.Eta.Month - 1, // JavaScript months are 0-indexed
          staticData.Eta.Day,
          staticData.Eta.Hour ?? 0,
          staticData.Eta.Minute ?? 0
        )
      } catch (error) {
        console.warn('[AIS Parser] Error parsing ETA:', error)
      }
    }

    // Calculate vessel dimensions
    let dimensions: { length: number; beam: number } | null = null
    if (staticData.Dimension) {
      const dim = staticData.Dimension
      if (dim.A && dim.B && dim.C && dim.D) {
        dimensions = {
          length: dim.A + dim.B, // Bow to stern
          beam: dim.C + dim.D, // Port to starboard
        }
      }
    }

    return {
      mmsi,
      vesselName: staticData.Name || metadata.ShipName || null,
      imoNumber: staticData.ImoNumber || null,
      callSign: staticData.CallSign || null,
      vesselType: staticData.Type || null,
      destination: staticData.Destination || null,
      eta,
      dimensions,
      draught: staticData.MaximumStaticDraught || null,
      rawMessage: message,
    }
  } catch (error) {
    console.error('[AIS Parser] Error parsing ship static data:', error)
    return null
  }
}

/**
 * Get human-readable navigation status
 */
export function getNavigationStatusDescription(status: number | null): string {
  if (status === null || status === undefined) return 'Unknown'

  const statusMap: Record<number, string> = {
    0: 'Under way using engine',
    1: 'At anchor',
    2: 'Not under command',
    3: 'Restricted manoeuvrability',
    4: 'Constrained by draught',
    5: 'Moored',
    6: 'Aground',
    7: 'Engaged in fishing',
    8: 'Under way sailing',
    15: 'Not defined',
  }

  return statusMap[status] || `Unknown (${status})`
}

/**
 * Get human-readable ship type
 */
export function getShipTypeDescription(type: number | null): string {
  if (type === null || type === undefined) return 'Unknown'

  // AIS ship type codes
  const typeMap: Record<number, string> = {
    20: 'Wing in ground',
    30: 'Fishing',
    31: 'Towing',
    32: 'Towing (large)',
    33: 'Dredging',
    34: 'Diving ops',
    35: 'Military ops',
    36: 'Sailing',
    37: 'Pleasure craft',
    40: 'High speed craft',
    50: 'Pilot vessel',
    51: 'Search and rescue',
    52: 'Tug',
    53: 'Port tender',
    54: 'Anti-pollution',
    55: 'Law enforcement',
    58: 'Medical',
    60: 'Passenger',
    70: 'Cargo',
    80: 'Tanker',
    90: 'Other',
  }

  // Handle ranges (e.g., 60-69 are all passenger ships)
  if (type >= 60 && type <= 69) return 'Passenger'
  if (type >= 70 && type <= 79) return 'Cargo'
  if (type >= 80 && type <= 89) return 'Tanker'

  return typeMap[type] || `Unknown type (${type})`
}

/**
 * Validate vessel position coordinates
 */
export function isValidPosition(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

/**
 * Check if vessel position is recent (within last N minutes)
 */
export function isPositionRecent(timestamp: string, maxMinutes: number = 30): boolean {
  try {
    const positionTime = new Date(timestamp).getTime()
    const now = Date.now()
    const ageMinutes = (now - positionTime) / (1000 * 60)
    return ageMinutes <= maxMinutes
  } catch (error) {
    return false
  }
}
