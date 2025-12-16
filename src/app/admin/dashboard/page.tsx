'use client'

import { Package, Users, CheckCircle, AlertTriangle } from 'lucide-react'
import StatsCard from '@/components/shared/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboardPage() {
  // TODO: Replace with actual API call to fetch admin stats
  const stats = {
    totalContainers: 0,
    pendingInspections: 0,
    completedInspections: 0,
    highRiskContainers: 0,
    totalUsers: 0,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to GTMS Staff Portal - Container Inspection Management
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Containers"
          value={stats.totalContainers}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Pending Inspections"
          value={stats.pendingInspections}
          icon={AlertTriangle}
          color="orange"
        />
        <StatsCard
          title="Completed Inspections"
          value={stats.completedInspections}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Registered Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
        />
      </div>

      {/* Pending Inspections Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Inspections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <AlertTriangle className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No pending inspections</p>
            <p className="mt-2 text-sm">
              Containers awaiting inspection will appear here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Package className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">No recent activity</p>
            <p className="mt-2 text-sm">
              Recent inspection activities will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
