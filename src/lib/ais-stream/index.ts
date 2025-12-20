/**
 * AIS Stream Integration Module
 * Real-time vessel tracking using AIS Stream API
 *
 * Documentation: https://aisstream.io/documentation
 */

export { AISStreamClient } from './client'
export {
  parsePositionReport,
  parseShipStaticData,
  getNavigationStatusDescription,
  getShipTypeDescription,
  isValidPosition,
  isPositionRecent,
} from './parser'
export type {
  AISMessageType,
  BoundingBox,
  AISSubscriptionMessage,
  AISMetadata,
  PositionReportMessage,
  ShipStaticDataMessage,
  AISStreamMessage,
  ParsedVesselPosition,
  ParsedVesselStatic,
  ConnectionStatus,
  AISStreamConfig,
  AISStreamState,
} from './types'
export { NAVIGATION_STATUS, SHIP_TYPES } from './types'
