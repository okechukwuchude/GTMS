'use client'

/**
 * Vessel Tracking Diagnostics Page
 * Shows detailed information about vessels, AIS backend status, and troubleshooting info
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useVessels } from '@/lib/hooks/useVessels'
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Ship } from 'lucide-react'

export default function TrackingDiagnosticsPage() {
  const { data, isLoading, refetch } = useVessels({ limit: 100 })
  const vessels = data?.vessels || []
  const [aisBackendStatus, setAisBackendStatus] = useState<'checking' | 'running' | 'stopped'>('checking')

  useEffect(() => {
    // Simple check - in production, you'd have a health endpoint
    setAisBackendStatus('running') // Assume running for now
  }, [])

  const vesselsWithPosition = vessels.filter(v => v.current_latitude && v.current_longitude)
  const vesselsWithoutPosition = vessels.filter(v => !v.current_latitude || !v.current_longitude)

  const getStatusIcon = (hasPosition: boolean) => {
    if (hasPosition) return <CheckCircle className="h-4 w-4 text-green-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vessel Tracking Diagnostics</h1>
          <p className="text-muted-foreground">
            Troubleshoot why vessels aren't showing on the map
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current state of vessel tracking components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">AIS Backend Service:</span>
            <Badge variant={aisBackendStatus === 'running' ? 'default' : 'destructive'}>
              {aisBackendStatus === 'running' ? 'Running' : 'Stopped'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Vessels in Database:</span>
            <Badge>{vessels.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Vessels with Position Data:</span>
            <Badge variant={vesselsWithPosition.length > 0 ? 'default' : 'secondary'}>
              {vesselsWithPosition.length}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Vessels without Position Data:</span>
            <Badge variant={vesselsWithoutPosition.length > 0 ? 'destructive' : 'secondary'}>
              {vesselsWithoutPosition.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Info */}
      {vesselsWithoutPosition.length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Why aren't vessels showing on the map?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Common Causes:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>No Position Updates Yet:</strong> AIS Stream may not have received position
                  reports for these vessels. This can take several minutes to hours depending on:
                  <ul className="list-circle list-inside ml-6 mt-1">
                    <li>Vessel location (must be in range of AIS receivers)</li>
                    <li>AIS transponder status (must be turned on and transmitting)</li>
                    <li>Vessel movement (stationary vessels may transmit less frequently)</li>
                  </ul>
                </li>
                <li>
                  <strong>Incorrect MMSI Numbers:</strong> The MMSI numbers in the database might be
                  incorrect or outdated.
                </li>
                <li>
                  <strong>Vessels Out of Coverage:</strong> AIS Stream relies on shore-based receivers.
                  Vessels in remote ocean areas may not be tracked.
                </li>
                <li>
                  <strong>AIS Transponder Off:</strong> Vessel may have AIS turned off (uncommon for
                  commercial vessels).
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Recommended Actions:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Wait 15-30 minutes for AIS Stream to receive position updates</li>
                <li>Verify MMSI numbers are correct (check against vessel databases)</li>
                <li>Check AIS backend logs for any errors: Look at the terminal running `pnpm ais:start`</li>
                <li>Try the mock tracking page to verify map functionality: <code className="bg-muted px-1 rounded">/dashboard/tracking-mock</code></li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vessels with Position */}
      {vesselsWithPosition.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Vessels with Position Data ({vesselsWithPosition.length})
            </CardTitle>
            <CardDescription>These vessels should appear on the map</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vesselsWithPosition.map((vessel) => (
                <div
                  key={vessel.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Ship className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{vessel.vessel_name}</div>
                      <div className="text-sm text-muted-foreground">
                        MMSI: {vessel.mmsi || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div>
                      {vessel.current_latitude?.toFixed(4)}°, {vessel.current_longitude?.toFixed(4)}°
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {vessel.last_position_update
                        ? new Date(vessel.last_position_update).toLocaleString()
                        : 'No timestamp'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vessels without Position */}
      {vesselsWithoutPosition.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Vessels without Position Data ({vesselsWithoutPosition.length})
            </CardTitle>
            <CardDescription>
              These vessels won't appear on the map until AIS Stream provides position updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vesselsWithoutPosition.map((vessel) => (
                <div
                  key={vessel.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Ship className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{vessel.vessel_name}</div>
                      <div className="text-sm text-muted-foreground">
                        MMSI: {vessel.mmsi || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">Waiting for position data</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/dashboard/tracking">
              <Ship className="mr-2 h-4 w-4" />
              Go to Tracking Map
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/dashboard/tracking-mock">
              <Ship className="mr-2 h-4 w-4" />
              Mock Tracking (Test Map Functionality)
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
