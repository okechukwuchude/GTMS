'use client'

/**
 * AIS Stream Direct Test Page
 * Connects directly to AIS Stream WebSocket and displays vessels on map
 * Bypasses database for testing purposes
 */

import { useState, useEffect, useRef } from 'react'
import { VesselMap, MapControls } from '@/components/vessels'
import type { VesselMarkerData } from '@/lib/mapbox/types'
import { MAPBOX_CONFIG } from '@/lib/mapbox/config'

interface AISVessel {
  mmsi: string
  lat: number
  lon: number
  speed?: number
  heading?: number
  shipName?: string
  destination?: string
  eta?: string
  timestamp: string
}

export default function TrackingTestPage() {
  const [vessels, setVessels] = useState<Map<string, AISVessel>>(new Map())
  const [connected, setConnected] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [mapStyle, setMapStyle] = useState<keyof typeof MAPBOX_CONFIG.styles>('streets')
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // AIS Stream API Key from environment
    const apiKey = process.env.NEXT_PUBLIC_AISSTREAM_API_KEY

    if (!apiKey) {
      console.error('[AIS Test] No API key found in NEXT_PUBLIC_AISSTREAM_API_KEY')
      return
    }

    // Prevent duplicate connections
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[AIS Test] WebSocket already connected')
      return
    }

    // Connect to AIS Stream WebSocket
    console.log('[AIS Test] Connecting to AIS Stream...')
    const ws = new WebSocket('wss://stream.aisstream.io/v0/stream')
    wsRef.current = ws

    let didSubscribe = false

    ws.onopen = () => {
      console.log('[AIS Test] WebSocket connected')
      setConnected(true)
      didSubscribe = true

      // Subscribe to AIS messages
      // This subscribes to a bounding box around Rotterdam port as an example
      const subscription = {
        APIKey: apiKey,
        BoundingBoxes: [
          [
            [51.8, 4.2], // Southwest corner (lat, lon)
            [52.0, 4.7], // Northeast corner (lat, lon)
          ],
        ],
      }

      console.log('[AIS Test] Sending subscription:', subscription)
      ws.send(JSON.stringify(subscription))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setMessageCount((prev) => prev + 1)

        // AIS Stream message structure
        const message = data.Message
        if (!message) return

        const positionReport = message.PositionReport
        const staticData = message.ShipStaticData

        // We're interested in Position Reports (types 1, 2, 3)
        if (positionReport) {
          const mmsi = String(message.UserID || positionReport.UserID)
          const lat = positionReport.Latitude
          const lon = positionReport.Longitude

          if (lat && lon) {
            setVessels((prev) => {
              const newVessels = new Map(prev)
              const existing = newVessels.get(mmsi)

              newVessels.set(mmsi, {
                mmsi,
                lat,
                lon,
                speed: positionReport.Sog, // Speed over ground
                heading: positionReport.TrueHeading,
                shipName: existing?.shipName || `Vessel ${mmsi}`,
                destination: existing?.destination,
                eta: existing?.eta,
                timestamp: new Date().toISOString(),
              })

              return newVessels
            })
          }
        }

        // Update vessel static data (name, destination, etc)
        if (staticData) {
          const mmsi = String(message.UserID || staticData.UserID)
          setVessels((prev) => {
            const newVessels = new Map(prev)
            const existing = newVessels.get(mmsi)

            if (existing) {
              newVessels.set(mmsi, {
                ...existing,
                shipName: staticData.Name || existing.shipName,
                destination: staticData.Destination,
                eta: staticData.Eta,
              })
            }

            return newVessels
          })
        }
      } catch (error) {
        console.error('[AIS Test] Error parsing message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('[AIS Test] WebSocket error:', error)
      setConnected(false)
    }

    ws.onclose = () => {
      console.log('[AIS Test] WebSocket disconnected')
      setConnected(false)
    }

    // Cleanup on unmount
    return () => {
      // Only close if we actually subscribed (not during StrictMode double-invoke)
      if (didSubscribe && wsRef.current) {
        console.log('[AIS Test] Closing WebSocket')
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [])

  // Convert AIS vessels to map markers
  const vesselMarkers: VesselMarkerData[] = Array.from(vessels.values()).map(
    (vessel) => ({
      id: vessel.mmsi,
      vesselId: vessel.mmsi,
      vesselName: vessel.shipName || `Vessel ${vessel.mmsi}`,
      imoNumber: 'N/A',
      mmsi: vessel.mmsi,
      position: {
        lng: vessel.lon,
        lat: vessel.lat,
      },
      status: 'in_transit' as any,
      heading: vessel.heading,
      speed: vessel.speed,
      destination: vessel.destination,
      eta: vessel.eta,
    })
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      {/* Status Bar */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-2">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">AIS Stream Test</h1>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-sm text-gray-600">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div>
            <span className="font-medium">{vessels.size}</span> vessels tracked
          </div>
          <div>
            <span className="font-medium">{messageCount}</span> messages received
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1">
        <VesselMap
          vessels={vesselMarkers}
          ports={[]}
          routes={[]}
          mapStyle={mapStyle}
        />

        <MapControls
          currentStyle={mapStyle}
          onStyleChange={setMapStyle}
          showVessels={true}
          onToggleVessels={() => {}}
          showPorts={false}
          onTogglePorts={() => {}}
          showRoutes={false}
          onToggleRoutes={() => {}}
        />
      </div>

      {/* Instructions */}
      {!connected && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-2 text-lg font-semibold">Connection Status</h2>
          <p className="text-sm text-gray-600">
            {process.env.NEXT_PUBLIC_AISSTREAM_API_KEY
              ? 'Connecting to AIS Stream...'
              : 'Please add NEXT_PUBLIC_AISSTREAM_API_KEY to your .env.local file'}
          </p>
        </div>
      )}
    </div>
  )
}
