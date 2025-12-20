'use client'

/**
 * MapControls Component
 * Controls for map style, layers, and view options
 */

import { Map, Layers, Navigation, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { MAPBOX_CONFIG } from '@/lib/mapbox/config'

interface MapControlsProps {
  currentStyle: keyof typeof MAPBOX_CONFIG.styles
  onStyleChange: (style: keyof typeof MAPBOX_CONFIG.styles) => void
  showVessels: boolean
  onToggleVessels: (show: boolean) => void
  showPorts: boolean
  onTogglePorts: (show: boolean) => void
  showRoutes: boolean
  onToggleRoutes: (show: boolean) => void
}

const STYLE_LABELS: Record<keyof typeof MAPBOX_CONFIG.styles, string> = {
  streets: 'Streets',
  satellite: 'Satellite',
  dark: 'Dark',
  light: 'Light',
  navigation: 'Navigation',
  outdoors: 'Outdoors',
}

export default function MapControls({
  currentStyle,
  onStyleChange,
  showVessels,
  onToggleVessels,
  showPorts,
  onTogglePorts,
  showRoutes,
  onToggleRoutes,
}: MapControlsProps) {
  return (
    <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
      {/* Map Style Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white shadow-md hover:bg-gray-50"
          >
            <Map className="mr-2 h-4 w-4" />
            {STYLE_LABELS[currentStyle]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {Object.entries(STYLE_LABELS).map(([key, label]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onStyleChange(key as keyof typeof MAPBOX_CONFIG.styles)}
              className={currentStyle === key ? 'bg-gray-100' : ''}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Layer Toggles */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white shadow-md hover:bg-gray-50"
          >
            <Layers className="mr-2 h-4 w-4" />
            Layers
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuCheckboxItem checked={showVessels} onCheckedChange={onToggleVessels}>
            <Navigation className="mr-2 h-4 w-4" />
            Vessels
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showPorts} onCheckedChange={onTogglePorts}>
            <Map className="mr-2 h-4 w-4" />
            Ports
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showRoutes} onCheckedChange={onToggleRoutes}>
            <Navigation className="mr-2 h-4 w-4" />
            Routes
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Legend */}
      <div className="rounded-lg bg-white p-3 shadow-md">
        <div className="mb-2 text-xs font-semibold text-gray-700">Status</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full bg-[#3B82F6]" />
            <span>In Transit</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full bg-[#10B981]" />
            <span>At Berth</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full bg-[#F59E0B]" />
            <span>Anchored</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full bg-[#EF4444]" />
            <span>High Risk</span>
          </div>
        </div>
      </div>
    </div>
  )
}
