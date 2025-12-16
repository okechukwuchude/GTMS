'use client'

import { Package, Ship, CheckCircle, AlertTriangle } from 'lucide-react'
import StatsCard from '@/components/shared/StatsCard'
import EmptyState from '@/components/shared/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboard } from '@/lib/hooks/useDashboard'

export default function DashboardPage() {
  const { data: stats, isLoading, isError, error } = useDashboard()

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to GTMS - Global Trade Monitoring System
        </p>
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
      {/* TODO: Implement recent containers list in Sprint 5 after Container API is ready */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Containers</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Package}
            title="No containers yet"
            description="Register your first container to start tracking shipments."
            action={{
              label: 'Register Container',
              onClick: () => {
                // TODO: Navigate to container registration page
                console.log('Navigate to container registration')
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
