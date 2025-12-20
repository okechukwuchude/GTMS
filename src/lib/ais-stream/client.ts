/**
 * AIS Stream WebSocket Client
 * Handles real-time vessel position updates from AIS Stream API
 *
 * IMPORTANT: Per documentation, subscription message MUST be sent
 * within 3 seconds of WebSocket connection or it will be closed.
 *
 * WARNING: Do NOT use directly in browser - API keys should be protected.
 * Implement a backend proxy for production use.
 */

import type {
  AISStreamConfig,
  AISStreamState,
  AISSubscriptionMessage,
  AISStreamMessage,
  ConnectionStatus,
} from './types'
import { parsePositionReport, parseShipStaticData } from './parser'

const DEFAULT_WS_URL = 'wss://stream.aisstream.io/v0/stream'
const SUBSCRIPTION_TIMEOUT = 2500 // Send subscription within 2.5s (buffer from 3s limit)
const DEFAULT_RECONNECT_INTERVAL = 5000 // 5 seconds
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 10

export class AISStreamClient {
  private ws: WebSocket | null = null
  private config: Required<AISStreamConfig>
  private state: AISStreamState
  private reconnectTimer: NodeJS.Timeout | null = null
  private subscriptionTimer: NodeJS.Timeout | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  constructor(config: AISStreamConfig) {
    this.config = {
      apiKey: config.apiKey,
      wsUrl: config.wsUrl || DEFAULT_WS_URL,
      boundingBoxes: config.boundingBoxes,
      filterMMSI: config.filterMMSI,
      filterMessageTypes: config.filterMessageTypes,
      reconnectInterval: config.reconnectInterval || DEFAULT_RECONNECT_INTERVAL,
      maxReconnectAttempts: config.maxReconnectAttempts || DEFAULT_MAX_RECONNECT_ATTEMPTS,
    }

    this.state = {
      status: 'disconnected',
      error: null,
      vessels: new Map(),
      vesselStatic: new Map(),
      lastUpdate: null,
      messageCount: 0,
      reconnectAttempts: 0,
    }
  }

  /**
   * Connect to AIS Stream WebSocket
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[AIS Stream] Already connected')
      return
    }

    this.updateStatus('connecting')
    console.log('[AIS Stream] Connecting to', this.config.wsUrl)

    try {
      this.ws = new WebSocket(this.config.wsUrl)

      // Set up event handlers
      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onerror = this.handleError.bind(this)
      this.ws.onclose = this.handleClose.bind(this)

      // Set timeout to send subscription message
      this.subscriptionTimer = setTimeout(() => {
        this.sendSubscription()
      }, 100) // Send immediately after connection

    } catch (error) {
      console.error('[AIS Stream] Connection error:', error)
      this.updateStatus('error', error instanceof Error ? error.message : 'Connection failed')
      this.scheduleReconnect()
    }
  }

  /**
   * Disconnect from AIS Stream
   */
  disconnect(): void {
    console.log('[AIS Stream] Disconnecting...')

    if (this.subscriptionTimer) {
      clearTimeout(this.subscriptionTimer)
      this.subscriptionTimer = null
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.updateStatus('disconnected')
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('[AIS Stream] WebSocket connected')
    this.updateStatus('connected')
    this.state.reconnectAttempts = 0

    // Subscription will be sent by the timer set in connect()
  }

  /**
   * Send subscription message
   * CRITICAL: Must be sent within 3 seconds of connection
   */
  private sendSubscription(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[AIS Stream] Cannot send subscription - WebSocket not open')
      return
    }

    const subscription: AISSubscriptionMessage = {
      APIKey: this.config.apiKey,
      BoundingBoxes: this.config.boundingBoxes,
    }

    if (this.config.filterMMSI && this.config.filterMMSI.length > 0) {
      subscription.FiltersShipMMSI = this.config.filterMMSI.slice(0, 50) // Max 50
    }

    if (this.config.filterMessageTypes && this.config.filterMessageTypes.length > 0) {
      subscription.FilterMessageTypes = this.config.filterMessageTypes
    }

    console.log('[AIS Stream] Sending subscription:', {
      boundingBoxes: subscription.BoundingBoxes.length,
      mmsiFilters: subscription.FiltersShipMMSI?.length || 0,
      messageTypeFilters: subscription.FilterMessageTypes?.length || 0,
    })

    this.ws.send(JSON.stringify(subscription))
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: AISStreamMessage = JSON.parse(event.data)

      this.state.messageCount++
      this.state.lastUpdate = new Date()

      // Parse based on message type
      if (message.MessageType === 'PositionReport' && message.Message.PositionReport) {
        const position = parsePositionReport(message)
        if (position) {
          this.state.vessels.set(position.mmsi, position)
          this.emit('position', position)
        }
      } else if (message.MessageType === 'ShipStaticData' && message.Message.ShipStaticData) {
        const staticData = parseShipStaticData(message)
        if (staticData) {
          this.state.vesselStatic.set(staticData.mmsi, staticData)
          this.emit('static', staticData)
        }
      }

      // Emit raw message for any custom processing
      this.emit('message', message)

    } catch (error) {
      console.error('[AIS Stream] Message parsing error:', error)
      this.emit('error', error)
    }
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(event: Event): void {
    console.error('[AIS Stream] WebSocket error:', event)
    this.updateStatus('error', 'WebSocket error occurred')
    this.emit('error', new Error('WebSocket error'))
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log('[AIS Stream] WebSocket closed:', event.code, event.reason)
    this.updateStatus('disconnected')
    this.emit('close', { code: event.code, reason: event.reason })

    // Attempt reconnection if not a normal closure
    if (event.code !== 1000) {
      this.scheduleReconnect()
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.state.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[AIS Stream] Max reconnection attempts reached')
      this.updateStatus('error', 'Max reconnection attempts reached')
      return
    }

    this.state.reconnectAttempts++
    const delay = this.config.reconnectInterval * this.state.reconnectAttempts

    console.log(
      `[AIS Stream] Reconnecting in ${delay}ms (attempt ${this.state.reconnectAttempts}/${this.config.maxReconnectAttempts})`
    )

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  /**
   * Update connection status
   */
  private updateStatus(status: ConnectionStatus, error: string | null = null): void {
    this.state.status = status
    this.state.error = error
    this.emit('status', { status, error })
  }

  /**
   * Event emitter - subscribe to events
   */
  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`[AIS Stream] Error in ${event} listener:`, error)
      }
    })
  }

  /**
   * Get current state
   */
  getState(): Readonly<AISStreamState> {
    return { ...this.state }
  }

  /**
   * Get vessel position by MMSI
   */
  getVessel(mmsi: string) {
    return this.state.vessels.get(mmsi) || null
  }

  /**
   * Get all vessel positions
   */
  getAllVessels() {
    return Array.from(this.state.vessels.values())
  }

  /**
   * Clear all vessel data
   */
  clearVessels(): void {
    this.state.vessels.clear()
    this.state.vesselStatic.clear()
  }
}
