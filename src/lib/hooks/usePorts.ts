'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { Port } from '@/types/container.types'

async function fetchPorts(): Promise<Port[]> {
  const response = await fetch('/api/ports')

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch ports')
  }

  return response.json()
}

/**
 * Hook to fetch all active ports
 * Ports don't change often, so we use a long staleTime (1 hour)
 */
export function usePorts() {
  return useQuery({
    queryKey: queryKeys.ports.list(),
    queryFn: fetchPorts,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    retry: 2,
  })
}
