'use client'

import { useState } from 'react'
import { Package, Ship, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import StatsCard from '@/components/shared/StatsCard'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import ContainerDialog from '@/components/containers/ContainerDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDashboard } from '@/lib/hooks/useDashboard'
import { useContainerList } from '@/lib/hooks/useContainers'

export default function DashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: stats, isError, error } = useDashboard()

  // Fetch recent containers (last 5)
  const { data: containersData, isLoading: containersLoading } = useContainerList({
    page: 1,
    limit: 5,
    sortBy: 'registration_date',
    sortOrder: 'desc',
  })

  const handleRegisterClick = () => {
    setDialogOpen(true)
  }

  // Loading and error states are handled by loading.tsx and error.tsx
  // But we can show inline errors for better UX
  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to GTMS - Global Trade Monitoring System
          </p>
        </div>
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load dashboard"
          description={error?.message || 'Unable to fetch dashboard statistics. Please try again.'}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to GTMS - Global Trade Monitoring System
          </p>
        </div>
        <Button onClick={handleRegisterClick} className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Register Container
        </Button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Containers"
          value={stats?.totalContainers || 0}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="In Transit"
          value={stats?.inTransit || 0}
          icon={Ship}
          color="blue"
        />
        <StatsCard
          title="Cleared"
          value={stats?.cleared || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="High Risk"
          value={stats?.highRisk || 0}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Recent Containers Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Containers</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/containers" className="flex items-center gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {containersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : containersData && containersData.data.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Container Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Origin Port</TableHead>
                    <TableHead>Destination Port</TableHead>
                    <TableHead>Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {containersData.data.map((container) => (
                    <TableRow key={container.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/containers/${container.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {container.container_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={container.status} size="sm" />
                      </TableCell>
                      <TableCell>
                        {container.origin_port
                          ? `${container.origin_port.name} (${container.origin_port.code})`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {container.destination_port
                          ? `${container.destination_port.name} (${container.destination_port.code})`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {container.registration_date
                          ? format(new Date(container.registration_date), 'MMM dd, yyyy')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No containers yet"
              description="Register your first container to start tracking shipments."
              action={{
                label: 'Register Container',
                onClick: handleRegisterClick,
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Container Dialog */}
      <ContainerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode="create"
      />
    </div>
  )
}
