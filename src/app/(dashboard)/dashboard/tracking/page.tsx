'use client'

/**
 * Vessel Tracking Page
 * Real-time vessel monitoring dashboard with interactive map
 */

import { useState } from 'react'
import { VesselMap, MapControls, VesselListSidebar, VesselDetailPanel } from '@/components/vessels'
import { useVessels, type Vessel } from '@/lib/hooks/useVessels'
import { useRealtimeVessels } from '@/lib/hooks/useRealtimeVessels'
import type { VesselMarkerData, PortMarkerData, RouteData } from '@/lib/mapbox/types'
import { MAPBOX_CONFIG } from '@/lib/mapbox/config'

export default function TrackingPage() {
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null)
  const [mapStyle, setMapStyle] = useState<keyof typeof MAPBOX_CONFIG.styles>('streets')
  const [showVessels, setShowVessels] = useState(true)
  const [showPorts, setShowPorts] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)

  // Fetch vessels
  const { data, isLoading } = useVessels({ limit: 500 })
  const vessels = data?.vessels || []

  // Enable real-time updates (polls every 30 seconds)
  useRealtimeVessels({ enabled: true })

  // Convert vessels to marker data
  const vesselMarkers: VesselMarkerData[] = vessels
    .filter((v) => v.current_latitude && v.current_longitude)
    .map((vessel) => ({
      id: vessel.id,
      vesselId: vessel.id,
      vesselName: vessel.vessel_name,
      imoNumber: vessel.imo_number || 'N/A',
      mmsi: vessel.mmsi || undefined,
      position: {
        lng: vessel.current_longitude!,
        lat: vessel.current_latitude!,
      },
      status: vessel.status as any,
      heading: vessel.current_heading || undefined,
      speed: vessel.current_speed_knots || undefined,
      eta: vessel.eta || undefined,
      destination: vessel.destination_name || vessel.destination_port?.name,
    }))

  // Port markers (from current/destination ports)
  const portMarkers: PortMarkerData[] = []
  const portSet = new Set<string>()

  vessels.forEach((vessel) => {
    if (vessel.current_port && !portSet.has(vessel.current_port.id)) {
      portSet.add(vessel.current_port.id)
      portMarkers.push({
        id: vessel.current_port.id,
        portId: vessel.current_port.id,
        portName: vessel.current_port.name,
        portCode: vessel.current_port.code,
        position: {
          lng: vessel.current_port.longitude!,
          lat: vessel.current_port.latitude!,
        },
        country: '', // Not available in current data
      })
    }

    if (vessel.destination_port && !portSet.has(vessel.destination_port.id)) {
      portSet.add(vessel.destination_port.id)
      portMarkers.push({
        id: vessel.destination_port.id,
        portId: vessel.destination_port.id,
        portName: vessel.destination_port.name,
        portCode: vessel.destination_port.code,
        position: {
          lng: vessel.destination_port.longitude!,
          lat: vessel.destination_port.latitude!,
        },
        country: '', // Not available in current data
      })
    }
  })

  // Routes (placeholder for now)
  const routes: RouteData[] = []

  // Handle vessel selection
  const handleVesselClick = (marker: VesselMarkerData) => {
    const vessel = vessels.find((v) => v.id === marker.vesselId)
    if (vessel) {
      setSelectedVessel(vessel)
    }
  }

  const handleVesselSelect = (vessel: Vessel) => {
    setSelectedVessel(vessel)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Vessel List Sidebar */}
      <VesselListSidebar
        vessels={vessels}
        selectedVesselId={selectedVessel?.id}
        onVesselSelect={handleVesselSelect}
        isLoading={isLoading}
      />

      {/* Map Container */}
      <div className="relative flex-1">
        <VesselMap
          vessels={showVessels ? vesselMarkers : []}
          ports={showPorts ? portMarkers : []}
          routes={showRoutes ? routes : []}
          selectedVesselId={selectedVessel?.id}
          onVesselClick={handleVesselClick}
          mapStyle={mapStyle}
        />

        <MapControls
          currentStyle={mapStyle}
          onStyleChange={setMapStyle}
          showVessels={showVessels}
          onToggleVessels={setShowVessels}
          showPorts={showPorts}
          onTogglePorts={setShowPorts}
          showRoutes={showRoutes}
          onToggleRoutes={setShowRoutes}
        />
      </div>

      {/* Vessel Detail Panel */}
      {selectedVessel && (
        <VesselDetailPanel vessel={selectedVessel} onClose={() => setSelectedVessel(null)} />
      )}
    </div>
  )
}
