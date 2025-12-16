'use client'

import { useQuery } from '@tanstack/react-query'

interface DashboardStats {
  totalContainers: number
  inTransit: number
  cleared: number
  highRisk: number
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/dashboard/stats')

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch dashboard stats')
  }

  return response.json()
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchOnWindowFocus: true,
    retry: 2,
  })
}
