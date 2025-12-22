/**
 * AIS Stream Backend Service
 * Server-side WebSocket client for AIS Stream
 * Based on seaspy architecture - runs as a separate process
 *
 * Usage: pnpm ais:start
 */

// Load environment variables from .env.local
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import WebSocket from 'ws'
import { createClient } from '@supabase/supabase-js'

// Configuration from environment
const AISSTREAM_API_KEY = process.env.AIS_STREAM_API_KEY || process.env.AISSTREAM_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate required environment variables
if (!AISSTREAM_API_KEY) {
  console.error('[AIS Backend] ERROR: AIS_STREAM_API_KEY is required in .env.local')
  process.exit(1)
}

if (!SUPABASE_URL) {
  console.error('[AIS Backend] ERROR: NEXT_PUBLIC_SUPABASE_URL is required in .env.local')
  process.exit(1)
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('[AIS Backend] ERROR: SUPABASE_SERVICE_ROLE_KEY is required in .env.local')
  process.exit(1)
}

// Timeouts (in seconds)
const SUBSCRIBE_TIMEOUT = 3
const HEARTBEAT_INTERVAL = 30
const HEARTBEAT_TIMEOUT = 10
const RECONNECT_DELAY = 5
const MAX_RECONNECT_DELAY = 30

// Test mode: Set to 'true' to subscribe to all vessels (like seaspy) - for debugging only
const TEST_MODE_NO_MMSI_FILTER = process.env.AIS_TEST_MODE === 'true'

// Bounding boxes to subscribe to (can be configured)
// Format: [[lat1, lon1], [lat2, lon2]] (southwest, northeast)
const DEFAULT_BOUNDING_BOXES = [
  [
    [51.8, 4.2], // Rotterdam area (southwest)
    [52.0, 4.7], // (northeast)
  ],
  // Add more bounding boxes as needed
]

// Test mode bounding boxes (broader coverage for testing)
const TEST_MODE_BOUNDING_BOXES = [
  [
    [25.0, -10.0], // West Africa (southwest)
    [38.0, 20.0], // (northeast)
  ],
]

interface AISSubscription {
  APIKey: string
  BoundingBoxes: number[][][]
  FiltersShipMMSI?: string[]
  FilterMessageTypes?: string[]
}

interface AISPacket {
  Message: {
    PositionReport?: {
      UserID: number
      Latitude: number
      Longitude: number
      Sog: number // Speed over ground
      Cog: number // Course over ground
      TrueHeading: number
      NavigationalStatus: number
    }
    ShipStaticData?: {
      UserID: number
      Name: string
      Destination: string
      Eta: string
      CallSign: string
      ImoNumber: number
      Type: number
    }
  }
  MessageType: string
  MetaData: {
    MMSI: number
    ShipName: string
    latitude: number
    longitude: number
    time_utc: string
  }
}

class AISStreamBackend {
  private ws: WebSocket | null = null
  private supabase: ReturnType<typeof createClient>
  private heartbeatInterval: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private isShuttingDown = false
  private trackedMMSIs: string[] = []

  constructor() {
    // Initialize Supabase client with service role key (bypasses RLS)
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log('[AIS Backend] Initialized')
  }

  async start() {
    console.log('[AIS Backend] Starting...')

    // Get list of vessels to track from database
    await this.loadVesselsToTrack()

    this.connect()

    // Handle graceful shutdown
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())

    // Refresh vessel list every hour
    setInterval(() => this.loadVesselsToTrack(), 60 * 60 * 1000)
  }

  private async loadVesselsToTrack() {
    try {
      // Get all unique MMSIs from user_vessels
      const { data: userVessels, error } = await this.supabase
        .from('user_vessels')
        .select('vessel_id, vessels(mmsi)')

      if (error) {
        console.error('[AIS Backend] Error loading vessels:', error)
        return
      }

      // Extract MMSIs
      const mmsiList = userVessels
        ?.map((uv: any) => uv.vessels?.mmsi)
        .filter((mmsi: string | null) => mmsi !== null) as string[]

      if (mmsiList && mmsiList.length > 0) {
        console.log(`[AIS Backend] Tracking ${mmsiList.length} vessels by MMSI`)
        // Store for subscription
        this.trackedMMSIs = mmsiList
      } else {
        console.log('[AIS Backend] No vessels to track yet. Using bounding box subscription.')
        this.trackedMMSIs = []
      }
    } catch (error) {
      console.error('[AIS Backend] Error in loadVesselsToTrack:', error)
    }
  }

  private connect() {
    if (this.isShuttingDown) return

    console.log('[AIS Backend] Connecting to AIS Stream...')
    this.ws = new WebSocket('wss://stream.aisstream.io/v0/stream')

    this.ws.on('open', () => {
      console.log('[AIS Backend] WebSocket connected')
      this.reconnectAttempts = 0
      this.subscribe()
      this.startHeartbeat()
    })

    this.ws.on('message', (data: Buffer) => {
      this.handleMessage(data)
    })

    this.ws.on('error', (error) => {
      console.error('[AIS Backend] WebSocket error:', error.message)
    })

    this.ws.on('close', () => {
      console.log('[AIS Backend] WebSocket disconnected')
      this.stopHeartbeat()

      if (!this.isShuttingDown) {
        this.scheduleReconnect()
      }
    })
  }

  private subscribe() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[AIS Backend] Cannot subscribe - WebSocket not open')
      return
    }

    const subscription: AISSubscription = {
      APIKey: AISSTREAM_API_KEY,
      BoundingBoxes: TEST_MODE_NO_MMSI_FILTER ? TEST_MODE_BOUNDING_BOXES : DEFAULT_BOUNDING_BOXES,
      FilterMessageTypes: ['PositionReport', 'ShipStaticData'], // Request both position and static data
    }

    // TEST MODE: Skip MMSI filtering to receive all vessels (for debugging)
    if (TEST_MODE_NO_MMSI_FILTER) {
      console.log('[AIS Backend] 🧪 TEST MODE ENABLED - Receiving ALL vessels in area')
      console.log('[AIS Backend] Sending subscription:', {
        boxes: subscription.BoundingBoxes.length,
        mmsiFilters: 0,
        mode: 'TEST MODE - All vessels (no MMSI filter)',
        area: 'West Africa (25.0°N to 38.0°N, -10.0°W to 20.0°E)',
      })
    }
    // PRODUCTION MODE: Filter by user's vessels
    else if (this.trackedMMSIs.length > 0) {
      subscription.FiltersShipMMSI = this.trackedMMSIs
      console.log('[AIS Backend] Sending subscription:', {
        boxes: subscription.BoundingBoxes.length,
        mmsiFilters: subscription.FiltersShipMMSI.length,
        mode: 'MMSI-filtered (tracking user vessels only)',
      })
    } else {
      console.log('[AIS Backend] Sending subscription:', {
        boxes: subscription.BoundingBoxes.length,
        mmsiFilters: 0,
        mode: 'Bounding box (no user vessels yet)',
      })
    }

    this.ws.send(JSON.stringify(subscription))
  }

  private handleMessage(data: Buffer) {
    try {
      const packet: AISPacket = JSON.parse(data.toString())

      // Debug: Log message type
      console.log(`[AIS Backend] Received ${packet.MessageType} for MMSI ${packet.MetaData.MMSI}`)

      // Handle position reports
      if (packet.Message.PositionReport) {
        this.handlePositionReport(packet).catch((error) => {
          console.error(`[AIS Backend] Error handling position report for ${packet.MetaData.MMSI}:`, error)
        })
      }

      // Handle static data (ship name, destination, etc.)
      if (packet.Message.ShipStaticData) {
        this.handleStaticData(packet).catch((error) => {
          console.error(`[AIS Backend] Error handling static data for ${packet.MetaData.MMSI}:`, error)
        })
      }
    } catch (error) {
      console.error('[AIS Backend] Error parsing message:', error)
    }
  }

  private async handlePositionReport(packet: AISPacket) {
    const report = packet.Message.PositionReport!
    const metadata = packet.MetaData

    const mmsi = String(metadata.MMSI || report.UserID)
    const lat = metadata.latitude || report.Latitude
    const lon = metadata.longitude || report.Longitude

    if (!lat || !lon) {
      console.log(`[AIS Backend] ⚠️  No position data for ${mmsi}: lat=${lat}, lon=${lon}`)
      return
    }

    console.log(`[AIS Backend] 📍 Processing position for ${mmsi} at ${lat}, ${lon}`)

    try {
      // First, check if vessel exists
      const { data: existingVessel } = await this.supabase
        .from('vessels')
        .select('id')
        .eq('mmsi', mmsi)
        .single()

      if (existingVessel) {
        // Update existing vessel
        await this.supabase
          .from('vessels')
          .update({
            current_latitude: lat,
            current_longitude: lon,
            current_speed_knots: report.Sog || null,
            current_course: report.Cog || null,
            current_heading: report.TrueHeading || null,
            navigation_status: report.NavigationalStatus || null,
            last_position_update: metadata.time_utc || new Date().toISOString(),
            ais_data_source: 'aisstream',
          })
          .eq('mmsi', mmsi)

        // Insert position history
        await this.supabase.from('vessel_positions').insert({
          vessel_id: existingVessel.id,
          latitude: lat,
          longitude: lon,
          speed_knots: report.Sog || null,
          course_over_ground: report.Cog || null,
          heading: report.TrueHeading || null,
          navigation_status: report.NavigationalStatus || null,
          timestamp: metadata.time_utc || new Date().toISOString(),
          data_source: 'aisstream',
          message_type: 'PositionReport',
        })

        console.log(`[AIS Backend] Updated vessel ${mmsi} (${metadata.ShipName || 'Unknown'})`)
      } else {
        // Create new vessel
        const { data: newVessel } = await this.supabase
          .from('vessels')
          .insert({
            mmsi,
            vessel_name: metadata.ShipName || `Vessel ${mmsi}`,
            current_latitude: lat,
            current_longitude: lon,
            current_speed_knots: report.Sog || null,
            current_course: report.Cog || null,
            current_heading: report.TrueHeading || null,
            navigation_status: report.NavigationalStatus || null,
            last_position_update: metadata.time_utc || new Date().toISOString(),
            ais_data_source: 'aisstream',
            status: 'in_transit',
          })
          .select('id')
          .single()

        if (newVessel) {
          console.log(`[AIS Backend] Created new vessel ${mmsi} (${metadata.ShipName || 'Unknown'})`)
        }
      }
    } catch (error) {
      console.error(`[AIS Backend] Error storing position for ${mmsi}:`, error)
    }
  }

  private async handleStaticData(packet: AISPacket) {
    const staticData = packet.Message.ShipStaticData!
    const metadata = packet.MetaData

    const mmsi = String(metadata.MMSI || staticData.UserID)

    try {
      // Update or create vessel with static data
      await this.supabase
        .from('vessels')
        .upsert({
          mmsi,
          vessel_name: staticData.Name || metadata.ShipName || `Vessel ${mmsi}`,
          call_sign: staticData.CallSign || null,
          imo_number: staticData.ImoNumber ? String(staticData.ImoNumber) : null,
          vessel_type_code: staticData.Type || null,
          destination_name: staticData.Destination || null,
          eta: staticData.Eta || null,
          ais_data_source: 'aisstream',
          updated_at: new Date().toISOString(),
        })

      console.log(`[AIS Backend] Updated static data for ${mmsi} (${staticData.Name || 'Unknown'})`)
    } catch (error) {
      console.error(`[AIS Backend] Error storing static data for ${mmsi}:`, error)
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping()
      }
    }, HEARTBEAT_INTERVAL * 1000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private scheduleReconnect() {
    const delay = Math.min(
      RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts),
      MAX_RECONNECT_DELAY
    )

    console.log(`[AIS Backend] Reconnecting in ${delay} seconds...`)
    this.reconnectAttempts++

    setTimeout(() => {
      this.connect()
    }, delay * 1000)
  }

  private shutdown() {
    console.log('[AIS Backend] Shutting down...')
    this.isShuttingDown = true
    this.stopHeartbeat()

    if (this.ws) {
      this.ws.close()
    }

    process.exit(0)
  }
}

// Start the service
if (require.main === module) {
  const service = new AISStreamBackend()
  service.start()
}

export default AISStreamBackend
