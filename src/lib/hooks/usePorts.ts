'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { Port } from '@/types/container.types'
import { handleApiError, logError } from '@/lib/utils/error-handler'

async function fetchPorts(): Promise<Port[]> {
  try {
    const response = await fetch('/api/ports')

    if (!response.ok) {
      await handleApiError(response)
    }

    return response.json()
  } catch (error) {
    logError(error, 'fetchPorts')
    throw error
  }
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
