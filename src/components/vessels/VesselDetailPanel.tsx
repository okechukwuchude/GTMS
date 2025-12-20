'use client'

/**
 * VesselDetailPanel Component
 * Detailed information panel for selected vessel
 */

import { X, Ship, Anchor, Navigation, MapPin, Clock, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Vessel } from '@/lib/hooks/useVessels'
import { formatCoordinates, knotsToKmh } from '@/lib/mapbox/utils'
import { getNavigationStatusDescription, getShipTypeDescription } from '@/lib/ais-stream/parser'

interface VesselDetailPanelProps {
  vessel: Vessel
  onClose: () => void
}

const STATUS_COLORS: Record<string, string> = {
  in_transit: 'bg-blue-100 text-blue-800',
  at_berth: 'bg-green-100 text-green-800',
  anchored: 'bg-orange-100 text-orange-800',
  active: 'bg-blue-100 text-blue-800',
  inactive: 'bg-gray-100 text-gray-800',
  under_repair: 'bg-yellow-100 text-yellow-800',
  decommissioned: 'bg-red-100 text-red-800',
}

export default function VesselDetailPanel({ vessel, onClose }: VesselDetailPanelProps) {
  return (
    <div className="flex h-full w-96 flex-col border-l bg-white">
      {/* Header */}
      <div className="flex items-start justify-between border-b p-4">
        <div className="flex-1">
          <h2 className="mb-1 text-lg font-semibold">{vessel.vessel_name}</h2>
          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[vessel.status] || 'bg-gray-100 text-gray-800'}>
              {vessel.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {vessel.vessel_type && (
              <span className="text-xs text-gray-500">{vessel.vessel_type}</span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="position">Position</TabsTrigger>
              <TabsTrigger value="cargo">Cargo</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Vessel Identification */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Identification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {vessel.imo_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">IMO Number:</span>
                      <span className="font-medium">{vessel.imo_number}</span>
                    </div>
                  )}
                  {vessel.mmsi && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">MMSI:</span>
                      <span className="font-medium">{vessel.mmsi}</span>
                    </div>
                  )}
                  {vessel.call_sign && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Call Sign:</span>
                      <span className="font-medium">{vessel.call_sign}</span>
                    </div>
                  )}
                  {vessel.flag_country && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Flag:</span>
                      <span className="font-medium">{vessel.flag_country}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vessel Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {vessel.vessel_type_code !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">
                        {getShipTypeDescription(vessel.vessel_type_code)}
                      </span>
                    </div>
                  )}
                  {vessel.gross_tonnage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Tonnage:</span>
                      <span className="font-medium">{vessel.gross_tonnage.toLocaleString()} GT</span>
                    </div>
                  )}
                  {vessel.deadweight_tonnage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deadweight:</span>
                      <span className="font-medium">{vessel.deadweight_tonnage.toLocaleString()} DWT</span>
                    </div>
                  )}
                  {vessel.length_meters && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Length:</span>
                      <span className="font-medium">{vessel.length_meters} m</span>
                    </div>
                  )}
                  {vessel.beam_meters && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Beam:</span>
                      <span className="font-medium">{vessel.beam_meters} m</span>
                    </div>
                  )}
                  {vessel.draft_meters && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Draft:</span>
                      <span className="font-medium">{vessel.draft_meters} m</span>
                    </div>
                  )}
                  {vessel.built_year && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Built:</span>
                      <span className="font-medium">{vessel.built_year}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ownership */}
              {(vessel.owner_name || vessel.operator_name || vessel.manager_name) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Ownership</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {vessel.owner_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Owner:</span>
                        <span className="font-medium">{vessel.owner_name}</span>
                      </div>
                    )}
                    {vessel.operator_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Operator:</span>
                        <span className="font-medium">{vessel.operator_name}</span>
                      </div>
                    )}
                    {vessel.manager_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Manager:</span>
                        <span className="font-medium">{vessel.manager_name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Position Tab */}
            <TabsContent value="position" className="space-y-4">
              {/* Current Position */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Current Position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {vessel.current_latitude && vessel.current_longitude ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coordinates:</span>
                        <span className="font-medium">
                          {formatCoordinates({
                            lat: vessel.current_latitude,
                            lng: vessel.current_longitude,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Latitude:</span>
                        <span className="font-medium">{vessel.current_latitude.toFixed(6)}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Longitude:</span>
                        <span className="font-medium">{vessel.current_longitude.toFixed(6)}°</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">No position data available</p>
                  )}

                  {vessel.current_speed_knots !== null && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">Speed:</span>
                        <span className="font-medium">
                          {vessel.current_speed_knots.toFixed(1)} knots (
                          {knotsToKmh(vessel.current_speed_knots).toFixed(1)} km/h)
                        </span>
                      </div>
                    </>
                  )}

                  {vessel.current_course !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course:</span>
                      <span className="font-medium">{vessel.current_course.toFixed(1)}°</span>
                    </div>
                  )}

                  {vessel.current_heading !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heading:</span>
                      <span className="font-medium">{vessel.current_heading.toFixed(1)}°</span>
                    </div>
                  )}

                  {vessel.navigation_status !== null && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nav Status:</span>
                        <span className="font-medium">
                          {getNavigationStatusDescription(vessel.navigation_status)}
                        </span>
                      </div>
                    </>
                  )}

                  {vessel.last_position_update && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Update:</span>
                        <span className="font-medium">
                          {new Date(vessel.last_position_update).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Current Port */}
              {vessel.current_port && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Current Port</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{vessel.current_port.name}</span>
                    </div>
                    <div className="text-gray-600">Code: {vessel.current_port.code}</div>
                  </CardContent>
                </Card>
              )}

              {/* Destination */}
              {(vessel.destination_port || vessel.destination_name) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Destination</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {vessel.destination_port ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{vessel.destination_port.name}</span>
                        </div>
                        <div className="text-gray-600">Code: {vessel.destination_port.code}</div>
                      </>
                    ) : (
                      <div className="font-medium">{vessel.destination_name}</div>
                    )}
                    {vessel.eta && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>ETA: {new Date(vessel.eta).toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Cargo Tab */}
            <TabsContent value="cargo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Containers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <div className="text-center">
                      <Package className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                      <p className="text-sm">No container data available</p>
                      <p className="mt-1 text-xs">
                        Container information will appear here when linked
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}
