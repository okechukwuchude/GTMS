/**
 * AIS Service
 * Client-side service for managing AIS Stream WebSocket connection
 * and real-time vessel position updates
 */

import { AISStreamClient } from '@/lib/ais-stream'
import type { ParsedVesselPosition } from '@/lib/ais-stream/types'

class AISService {
  private client: AISStreamClient | null = null
  private listeners: Set<(position: ParsedVesselPosition) => void> = new Set()
  private isInitialized = false

  /**
   * Initialize AIS Stream connection
   * Note: This should be called from a server-side context or backend service
   * Browser connections are not recommended for security (API key exposure)
   */
  initialize(config: {
    apiKey: string
    boundingBoxes: [[number, number], [number, number]][]
    filterMMSI?: string[]
  }) {
    if (this.isInitialized) {
      console.warn('[AIS Service] Already initialized')
      return
    }

    this.client = new AISStreamClient(config)

    // Subscribe to position updates
    this.client.on('position', (position: ParsedVesselPosition) => {
      this.notifyListeners(position)
      this.sendToBackend(position)
    })

    // Connect to AIS Stream
    this.client.connect()
    this.isInitialized = true

    console.log('[AIS Service] Initialized and connected')
  }

  /**
   * Subscribe to position updates
   */
  onPositionUpdate(callback: (position: ParsedVesselPosition) => void) {
    this.listeners.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * Notify all listeners of position update
   */
  private notifyListeners(position: ParsedVesselPosition) {
    this.listeners.forEach((callback) => {
      try {
        callback(position)
      } catch (error) {
        console.error('[AIS Service] Error in position listener:', error)
      }
    })
  }

  /**
   * Send position update to backend for persistence
   */
  private async sendToBackend(position: ParsedVesselPosition) {
    try {
      const webhookSecret = process.env.NEXT_PUBLIC_AIS_WEBHOOK_SECRET

      const response = await fetch('/api/ais/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${webhookSecret}`,
        },
        body: JSON.stringify(position),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('[AIS Service] Failed to send position to backend:', error)
      }
    } catch (error) {
      console.error('[AIS Service] Error sending position to backend:', error)
    }
  }

  /**
   * Disconnect from AIS Stream
   */
  disconnect() {
    if (this.client) {
      this.client.disconnect()
      this.client = null
      this.isInitialized = false
      console.log('[AIS Service] Disconnected')
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return this.client?.getState().status || 'disconnected'
  }

  /**
   * Get current state
   */
  getState() {
    return this.client?.getState()
  }
}

// Singleton instance
export const aisService = new AISService()
