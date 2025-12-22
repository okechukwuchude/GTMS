'use client'

/**
 * Mock Vessel Tracking Page
 * Displays mock vessel data on the map for testing
 */

import { useState, useEffect } from 'react'
import { VesselMap, MapControls, VesselListSidebar, VesselDetailPanel } from '@/components/vessels'
import type { VesselMarkerData } from '@/lib/mapbox/types'
import type { Vessel } from '@/lib/hooks/useVessels'
import { MAPBOX_CONFIG } from '@/lib/mapbox/config'

// Mock vessel data around Rotterdam port
const MOCK_VESSELS: Vessel[] = [
  {
    id: '1',
    imo_number: 'IMO9234567',
    mmsi: '244123456',
    vessel_name: 'MSC Rotterdam',
    call_sign: 'PBXM',
    vessel_type: 'Container Ship',
    vessel_type_code: 70,
    flag_country: 'NLD',
    gross_tonnage: 95000,
    net_tonnage: 50000,
    deadweight_tonnage: 100000,
    built_year: 2018,
    length_meters: 350,
    beam_meters: 48,
    draft_meters: 14,
    owner_name: 'MSC Mediterranean Shipping Company',
    operator_name: 'MSC',
    manager_name: 'MSC Ship Management',
    status: 'in_transit',
    current_latitude: 51.9225,
    current_longitude: 4.47917,
    current_speed_knots: 12.5,
    current_course: 45,
    current_heading: 48,
    navigation_status: 0,
    current_port_id: null,
    destination_port_id: null,
    destination_name: 'Hamburg',
    eta: '2024-03-25T14:00:00Z',
    last_position_update: new Date().toISOString(),
    ais_data_source: 'mock',
    position_update_frequency_seconds: 30,
    last_ais_message: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    imo_number: 'IMO9345678',
    mmsi: '244234567',
    vessel_name: 'Maersk Explorer',
    call_sign: 'DZBN',
    vessel_type: 'Container Ship',
    vessel_type_code: 70,
    flag_country: 'DNK',
    gross_tonnage: 87000,
    net_tonnage: 45000,
    deadweight_tonnage: 95000,
    built_year: 2020,
    length_meters: 340,
    beam_meters: 46,
    draft_meters: 13.5,
    owner_name: 'Maersk Line',
    operator_name: 'Maersk',
    manager_name: 'Maersk Ship Management',
    status: 'at_berth',
    current_latitude: 51.8975,
    current_longitude: 4.4235,
    current_speed_knots: 0,
    current_course: 0,
    current_heading: 180,
    navigation_status: 5,
    current_port_id: null,
    destination_port_id: null,
    destination_name: 'Antwerp',
    eta: null,
    last_position_update: new Date().toISOString(),
    ais_data_source: 'mock',
    position_update_frequency_seconds: 30,
    last_ais_message: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    imo_number: 'IMO9456789',
    mmsi: '244345678',
    vessel_name: 'CMA CGM Liberty',
    call_sign: 'FMSU',
    vessel_type: 'Container Ship',
    vessel_type_code: 70,
    flag_country: 'FRA',
    gross_tonnage: 92000,
    net_tonnage: 48000,
    deadweight_tonnage: 98000,
    built_year: 2019,
    length_meters: 345,
    beam_meters: 47,
    draft_meters: 14.2,
    owner_name: 'CMA CGM',
    operator_name: 'CMA CGM',
    manager_name: 'CMA CGM Ship Management',
    status: 'in_transit',
    current_latitude: 51.9500,
    current_longitude: 4.5200,
    current_speed_knots: 15.2,
    current_course: 270,
    current_heading: 268,
    navigation_status: 0,
    current_port_id: null,
    destination_port_id: null,
    destination_name: 'Rotterdam',
    eta: '2024-03-24T18:30:00Z',
    last_position_update: new Date().toISOString(),
    ais_data_source: 'mock',
    position_update_frequency_seconds: 30,
    last_ais_message: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function TrackingMockPage() {
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null)
  const [mapStyle, setMapStyle] = useState<keyof typeof MAPBOX_CONFIG.styles>('streets')
  const [vessels, setVessels] = useState<Vessel[]>(MOCK_VESSELS)

  // Simulate vessel movement
  useEffect(() => {
    const interval = setInterval(() => {
      setVessels((prev) =>
        prev.map((vessel) => {
          // Only move vessels that are in transit
          if (vessel.status !== 'in_transit') return vessel

          // Simulate small position changes
          const latChange = (Math.random() - 0.5) * 0.001
          const lonChange = (Math.random() - 0.5) * 0.001

          return {
            ...vessel,
            current_latitude: (vessel.current_latitude || 0) + latChange,
            current_longitude: (vessel.current_longitude || 0) + lonChange,
            last_position_update: new Date().toISOString(),
          }
        })
      )
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

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
      destination: vessel.destination_name,
    }))

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
        isLoading={false}
      />

      {/* Map Container */}
      <div className="relative flex-1">
        {/* Mock Data Banner */}
        <div className="absolute left-4 top-4 z-10 rounded-lg bg-yellow-100 px-4 py-2 shadow-md">
          <p className="text-sm font-medium text-yellow-800">
            📍 Mock Data - Vessels updating every 5 seconds
          </p>
        </div>

        <VesselMap
          vessels={vesselMarkers}
          ports={[]}
          routes={[]}
          selectedVesselId={selectedVessel?.id}
          onVesselClick={handleVesselClick}
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

      {/* Vessel Detail Panel */}
      {selectedVessel && (
        <VesselDetailPanel vessel={selectedVessel} onClose={() => setSelectedVessel(null)} />
      )}
    </div>
  )
}
