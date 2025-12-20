'use client'

/**
 * VesselListSidebar Component
 * Sidebar displaying list of vessels with filtering and search
 */

import { useState } from 'react'
import { Ship, Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Vessel } from '@/lib/hooks/useVessels'
import { MAPBOX_CONFIG } from '@/lib/mapbox/config'
import { formatCoordinates } from '@/lib/mapbox/utils'

interface VesselListSidebarProps {
  vessels: Vessel[]
  selectedVesselId?: string | null
  onVesselSelect: (vessel: Vessel) => void
  isLoading?: boolean
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  in_transit: 'In Transit',
  at_berth: 'At Berth',
  anchored: 'Anchored',
  under_repair: 'Under Repair',
  decommissioned: 'Decommissioned',
}

export default function VesselListSidebar({
  vessels,
  selectedVesselId,
  onVesselSelect,
  isLoading = false,
}: VesselListSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter vessels
  const filteredVessels = vessels.filter((vessel) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      vessel.vessel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vessel.mmsi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vessel.imo_number?.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter === 'all' || vessel.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      in_transit: 'bg-blue-100 text-blue-800',
      at_berth: 'bg-green-100 text-green-800',
      anchored: 'bg-orange-100 text-orange-800',
      active: 'bg-blue-100 text-blue-800',
      inactive: 'bg-gray-100 text-gray-800',
      under_repair: 'bg-yellow-100 text-yellow-800',
      decommissioned: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex h-full w-80 flex-col border-r bg-white">
      {/* Header */}
      <div className="border-b p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Vessels</h2>
          <Badge variant="secondary">{filteredVessels.length}</Badge>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search vessels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="at_berth">At Berth</SelectItem>
            <SelectItem value="anchored">Anchored</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="under_repair">Under Repair</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vessel List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="mb-3 animate-pulse">
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : filteredVessels.length === 0 ? (
          <div className="p-8 text-center">
            <Ship className="mx-auto mb-2 h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">No vessels found</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredVessels.map((vessel) => (
              <button
                key={vessel.id}
                onClick={() => onVesselSelect(vessel)}
                className={`mb-2 w-full rounded-lg border p-3 text-left transition-colors hover:bg-gray-50 ${
                  vessel.id === selectedVesselId
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                {/* Vessel Name & Status */}
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{vessel.vessel_name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      {vessel.mmsi && <span>MMSI: {vessel.mmsi}</span>}
                      {vessel.imo_number && <span>IMO: {vessel.imo_number}</span>}
                    </div>
                  </div>
                  <Badge className={`ml-2 text-xs ${getStatusColor(vessel.status)}`}>
                    {STATUS_LABELS[vessel.status] || vessel.status}
                  </Badge>
                </div>

                {/* Vessel Info */}
                <div className="space-y-1 text-xs text-gray-600">
                  {vessel.vessel_type && (
                    <div className="flex items-center gap-1">
                      <Ship className="h-3 w-3" />
                      <span>{vessel.vessel_type}</span>
                    </div>
                  )}

                  {vessel.current_speed_knots !== null && (
                    <div>Speed: {vessel.current_speed_knots.toFixed(1)} knots</div>
                  )}

                  {vessel.current_latitude && vessel.current_longitude && (
                    <div className="truncate">
                      Position:{' '}
                      {formatCoordinates({
                        lat: vessel.current_latitude,
                        lng: vessel.current_longitude,
                      })}
                    </div>
                  )}

                  {vessel.destination_port && (
                    <div className="truncate">
                      Destination: {vessel.destination_port.name} ({vessel.destination_port.code})
                    </div>
                  )}

                  {vessel.eta && (
                    <div>ETA: {new Date(vessel.eta).toLocaleDateString()}</div>
                  )}

                  {vessel.last_position_update && (
                    <div className="text-gray-400">
                      Updated: {new Date(vessel.last_position_update).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
