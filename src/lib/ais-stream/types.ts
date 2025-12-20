/**
 * AIS Stream TypeScript Types
 * Based on official documentation: https://aisstream.io/documentation
 */

/**
 * AIS Message Types (25+ types supported)
 */
export type AISMessageType =
  | 'PositionReport'
  | 'ShipStaticData'
  | 'BaseStationReport'
  | 'SafetyBroadcastMessage'
  | 'StandardClassBPositionReport'
  | 'ExtendedClassBPositionReport'
  | 'AidsToNavigationReport'
  | 'Interrogation'
  | 'MultiSlotBinaryMessage'
  | 'LongRangeAisBroadcastMessage'
  | string // Allow other message types

/**
 * Bounding Box: [[lat1, lng1], [lat2, lng2]]
 * Defines a geographic area to receive vessel updates
 * lat: -90 to 90, lng: -180 to 180
 */
export type BoundingBox = [[number, number], [number, number]]

/**
 * AIS Stream Subscription Message
 * MUST be sent within 3 seconds of WebSocket connection
 */
export interface AISSubscriptionMessage {
  APIKey: string
  BoundingBoxes: BoundingBox[] // Required - at least one bounding box
  FiltersShipMMSI?: string[] // Optional - up to 50 MMSI numbers
  FilterMessageTypes?: AISMessageType[] // Optional - specific message types
}

/**
 * AIS Stream Message Metadata
 * Includes last known position and vessel info beyond standard AIS
 */
export interface AISMetadata {
  MMSI: number
  MMSI_String?: string
  ShipName?: string
  latitude: number
  longitude: number
  time_utc: string
  // Additional metadata fields may be present
  [key: string]: any
}

/**
 * Position Report Message Content
 */
export interface PositionReportMessage {
  Cog?: number // Course over ground (degrees)
  Latitude: number
  Longitude: number
  NavigationalStatus?: number
  RateOfTurn?: number
  Sog?: number // Speed over ground (knots)
  TrueHeading?: number
  Timestamp?: number
  UserID?: number // MMSI
  Valid?: boolean
  // Other fields from AIS spec
  [key: string]: any
}

/**
 * Ship Static Data Message Content
 */
export interface ShipStaticDataMessage {
  AisVersion?: number
  CallSign?: string
  Destination?: string
  Dimension?: {
    A: number // Bow to reference (meters)
    B: number // Stern to reference (meters)
    C: number // Port side to reference (meters)
    D: number // Starboard to reference (meters)
  }
  Eta?: {
    Month: number
    Day: number
    Hour: number
    Minute: number
  } | null
  ImoNumber?: number
  MaximumStaticDraught?: number
  Name?: string
  Type?: number // Ship type code
  UserID?: number // MMSI
  Valid?: boolean
  // Other fields from AIS spec
  [key: string]: any
}

/**
 * AIS Stream WebSocket Message
 * Structure: { MessageType, Metadata, Message }
 */
export interface AISStreamMessage {
  MessageType: AISMessageType
  MetaData: AISMetadata
  Message: {
    PositionReport?: PositionReportMessage
    ShipStaticData?: ShipStaticDataMessage
    [key: string]: any // Support for other message types
  }
}

/**
 * Parsed Vessel Position (simplified for our app)
 */
export interface ParsedVesselPosition {
  mmsi: string
  vesselName: string | null
  latitude: number
  longitude: number
  speedKnots: number | null
  courseOverGround: number | null
  heading: number | null
  navigationStatus: number | null
  timestamp: string
  rawMessage?: AISStreamMessage
}

/**
 * Parsed Vessel Static Data
 */
export interface ParsedVesselStatic {
  mmsi: string
  vesselName: string | null
  imoNumber: number | null
  callSign: string | null
  vesselType: number | null
  destination: string | null
  eta: Date | null
  dimensions: {
    length: number // A + B
    beam: number // C + D
  } | null
  draught: number | null
  rawMessage?: AISStreamMessage
}

/**
 * WebSocket Connection Status
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

/**
 * AIS Stream Client Configuration
 */
export interface AISStreamConfig {
  apiKey: string
  wsUrl?: string // Default: wss://stream.aisstream.io/v0/stream
  boundingBoxes: BoundingBox[]
  filterMMSI?: string[] // Max 50 MMSI numbers
  filterMessageTypes?: AISMessageType[]
  reconnectInterval?: number // milliseconds, default: 5000
  maxReconnectAttempts?: number // default: 10
}

/**
 * AIS Stream Client State
 */
export interface AISStreamState {
  status: ConnectionStatus
  error: string | null
  vessels: Map<string, ParsedVesselPosition> // Key: MMSI
  vesselStatic: Map<string, ParsedVesselStatic> // Key: MMSI
  lastUpdate: Date | null
  messageCount: number
  reconnectAttempts: number
}

/**
 * Navigation Status Descriptions
 */
export const NAVIGATION_STATUS: Record<number, string> = {
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

/**
 * Ship Type Descriptions
 */
export const SHIP_TYPES: Record<number, string> = {
  20: 'Wing in ground',
  30: 'Fishing',
  31: 'Towing',
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
