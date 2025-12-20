'use client'

/**
 * VesselMap Component
 * Interactive Mapbox map displaying vessels, ports, and routes
 */

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MAPBOX_CONFIG } from '@/lib/mapbox/config'
import type {
  VesselMarkerData,
  PortMarkerData,
  RouteData,
  MapCoordinates,
} from '@/lib/mapbox/types'
import { createVesselPopupHTML, createPortPopupHTML } from '@/lib/mapbox/utils'

interface VesselMapProps {
  vessels?: VesselMarkerData[]
  ports?: PortMarkerData[]
  routes?: RouteData[]
  selectedVesselId?: string | null
  selectedPortId?: string | null
  onVesselClick?: (vessel: VesselMarkerData) => void
  onPortClick?: (port: PortMarkerData) => void
  mapStyle?: keyof typeof MAPBOX_CONFIG.styles
  className?: string
  initialCenter?: MapCoordinates
  initialZoom?: number
}

export default function VesselMap({
  vessels = [],
  ports = [],
  routes = [],
  selectedVesselId,
  selectedPortId,
  onVesselClick,
  onPortClick,
  mapStyle = 'streets',
  className = '',
  initialCenter,
  initialZoom,
}: VesselMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const vesselMarkers = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const portMarkers = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const routeLayers = useRef<Map<string, string>>(new Map())

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!accessToken) {
      console.error('[VesselMap] Mapbox token not found')
      return
    }

    mapboxgl.accessToken = accessToken

    // Create map instance
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_CONFIG.styles[mapStyle],
      center: [
        initialCenter?.lng || MAPBOX_CONFIG.defaultCenter.lng,
        initialCenter?.lat || MAPBOX_CONFIG.defaultCenter.lat,
      ],
      zoom: initialZoom || MAPBOX_CONFIG.defaultZoom,
      attributionControl: false,
    })

    // Add navigation controls
    mapInstance.addControl(
      new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
      }),
      'top-right'
    )

    // Add scale control
    mapInstance.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric',
      }),
      'bottom-left'
    )

    // Mark map as loaded
    mapInstance.on('load', () => {
      setMapLoaded(true)
    })

    map.current = mapInstance

    // Cleanup
    return () => {
      mapInstance.remove()
      map.current = null
      setMapLoaded(false)
    }
  }, [mapStyle, initialCenter, initialZoom])

  // Update vessel markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const currentMap = map.current

    // Remove old markers that are no longer in the vessels list
    const vesselIds = new Set(vessels.map((v) => v.id))
    vesselMarkers.current.forEach((marker, id) => {
      if (!vesselIds.has(id)) {
        marker.remove()
        vesselMarkers.current.delete(id)
      }
    })

    // Add or update vessel markers
    vessels.forEach((vessel) => {
      const existingMarker = vesselMarkers.current.get(vessel.id)

      if (existingMarker) {
        // Update existing marker position
        existingMarker.setLngLat([vessel.position.lng, vessel.position.lat])
      } else {
        // Create new marker
        const el = document.createElement('div')
        el.className = 'vessel-marker'
        el.style.width = '32px'
        el.style.height = '32px'
        el.style.cursor = 'pointer'
        el.style.backgroundSize = 'contain'
        el.style.backgroundRepeat = 'no-repeat'
        el.style.backgroundPosition = 'center'

        // Vessel icon with color based on status
        const color = MAPBOX_CONFIG.vesselColors[vessel.status] || '#3B82F6'
        el.innerHTML = `
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" fill="${color}" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
          </svg>
        `

        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 16,
          closeButton: false,
        }).setHTML(createVesselPopupHTML(vessel))

        // Create marker
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([vessel.position.lng, vessel.position.lat])
          .setPopup(popup)
          .addTo(currentMap)

        // Click handler
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onVesselClick?.(vessel)
        })

        vesselMarkers.current.set(vessel.id, marker)
      }

      // Highlight selected vessel
      const markerEl = vesselMarkers.current.get(vessel.id)?.getElement()
      if (markerEl) {
        if (vessel.id === selectedVesselId) {
          markerEl.style.transform = 'scale(1.3)'
          markerEl.style.zIndex = '1000'
        } else {
          markerEl.style.transform = 'scale(1)'
          markerEl.style.zIndex = '1'
        }
      }
    })
  }, [vessels, selectedVesselId, mapLoaded, onVesselClick])

  // Update port markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const currentMap = map.current

    // Remove old markers
    const portIds = new Set(ports.map((p) => p.id))
    portMarkers.current.forEach((marker, id) => {
      if (!portIds.has(id)) {
        marker.remove()
        portMarkers.current.delete(id)
      }
    })

    // Add or update port markers
    ports.forEach((port) => {
      const existingMarker = portMarkers.current.get(port.id)

      if (existingMarker) {
        existingMarker.setLngLat([port.position.lng, port.position.lat])
      } else {
        // Create port marker element
        const el = document.createElement('div')
        el.className = 'port-marker'
        el.style.width = '24px'
        el.style.height = '24px'
        el.style.cursor = 'pointer'

        // Port icon
        el.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#10B981" stroke="white" stroke-width="1"/>
          </svg>
        `

        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 12,
          closeButton: false,
        }).setHTML(createPortPopupHTML(port))

        // Create marker
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([port.position.lng, port.position.lat])
          .setPopup(popup)
          .addTo(currentMap)

        // Click handler
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onPortClick?.(port)
        })

        portMarkers.current.set(port.id, marker)
      }

      // Highlight selected port
      const markerEl = portMarkers.current.get(port.id)?.getElement()
      if (markerEl) {
        if (port.id === selectedPortId) {
          markerEl.style.transform = 'scale(1.2)'
          markerEl.style.zIndex = '999'
        } else {
          markerEl.style.transform = 'scale(1)'
          markerEl.style.zIndex = '1'
        }
      }
    })
  }, [ports, selectedPortId, mapLoaded, onPortClick])

  // Draw routes
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const currentMap = map.current

    // Remove old route layers
    const routeIds = new Set(routes.map((r) => r.id))
    routeLayers.current.forEach((layerId, routeId) => {
      if (!routeIds.has(routeId)) {
        if (currentMap.getLayer(layerId)) {
          currentMap.removeLayer(layerId)
        }
        if (currentMap.getSource(layerId)) {
          currentMap.removeSource(layerId)
        }
        routeLayers.current.delete(routeId)
      }
    })

    // Add or update routes
    routes.forEach((route) => {
      const sourceId = `route-${route.id}`
      const layerId = `route-layer-${route.id}`

      const coordinates = route.coordinates.map((coord) => [coord.lng, coord.lat])

      const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
        type: 'Feature',
        properties: {
          routeType: route.type,
        },
        geometry: {
          type: 'LineString',
          coordinates,
        },
      }

      if (currentMap.getSource(sourceId)) {
        const source = currentMap.getSource(sourceId) as mapboxgl.GeoJSONSource
        source.setData(geojson)
      } else {
        currentMap.addSource(sourceId, {
          type: 'geojson',
          data: geojson,
        })

        // Route color based on type
        const color =
          route.type === 'active'
            ? '#3B82F6'
            : route.type === 'completed'
              ? '#10B981'
              : '#94A3B8'

        currentMap.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': color,
            'line-width': route.type === 'active' ? 3 : 2,
            'line-opacity': route.type === 'active' ? 1 : 0.6,
            'line-dasharray': route.type === 'planned' ? [2, 2] : undefined,
          },
        })

        routeLayers.current.set(route.id, layerId)
      }
    })
  }, [routes, mapLoaded])

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div ref={mapContainer} className="h-full w-full" />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}
