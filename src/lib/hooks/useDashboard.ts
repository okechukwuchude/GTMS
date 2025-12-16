'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { handleApiError, logError } from '@/lib/utils/error-handler'

interface DashboardStats {
  totalContainers: number
  inTransit: number
  cleared: number
  highRisk: number
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await fetch('/api/dashboard/stats')

    if (!response.ok) {
      await handleApiError(response)
    }

    return response.json()
  } catch (error) {
    logError(error, 'fetchDashboardStats')
    throw error
  }
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: fetchDashboardStats,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchOnWindowFocus: true,
    retry: 2,
  })
}
