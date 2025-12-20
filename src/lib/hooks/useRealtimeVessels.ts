/**
 * useRealtimeVessels Hook
 * React hook for real-time vessel position updates via AIS Stream
 */

import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { vesselKeys } from './useVessels'
import type { ParsedVesselPosition } from '@/lib/ais-stream/types'

interface UseRealtimeVesselsOptions {
  enabled?: boolean
  onPositionUpdate?: (position: ParsedVesselPosition) => void
}

export function useRealtimeVessels(options: UseRealtimeVesselsOptions = {}) {
  const { enabled = true, onPositionUpdate } = options
  const queryClient = useQueryClient()

  // Handle position updates
  const handlePositionUpdate = useCallback(
    (position: ParsedVesselPosition) => {
      // Invalidate vessel queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: vesselKeys.lists() })

      // Call custom callback if provided
      onPositionUpdate?.(position)
    },
    [queryClient, onPositionUpdate]
  )

  useEffect(() => {
    if (!enabled) return

    // Subscribe to position updates via polling
    // Note: In production, this should be replaced with WebSocket or Server-Sent Events
    const pollInterval = parseInt(
      process.env.NEXT_PUBLIC_VESSEL_POSITION_UPDATE_INTERVAL_MS || '30000'
    )

    const intervalId = setInterval(() => {
      // Invalidate vessel queries to fetch latest positions
      queryClient.invalidateQueries({ queryKey: vesselKeys.lists() })
    }, pollInterval)

    return () => {
      clearInterval(intervalId)
    }
  }, [enabled, queryClient])

  return {
    isEnabled: enabled,
  }
}

/**
 * useVesselPositionUpdates Hook
 * Subscribe to real-time position updates for a specific vessel
 */
export function useVesselPositionUpdates(
  vesselId: string | null,
  options: { enabled?: boolean; onUpdate?: () => void } = {}
) {
  const { enabled = true, onUpdate } = options
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !vesselId) return

    // Poll for position updates
    const pollInterval = parseInt(
      process.env.NEXT_PUBLIC_VESSEL_POSITION_UPDATE_INTERVAL_MS || '30000'
    )

    const intervalId = setInterval(() => {
      // Invalidate specific vessel queries
      queryClient.invalidateQueries({ queryKey: vesselKeys.detail(vesselId) })
      queryClient.invalidateQueries({ queryKey: vesselKeys.positions(vesselId) })
      onUpdate?.()
    }, pollInterval)

    return () => {
      clearInterval(intervalId)
    }
  }, [vesselId, enabled, queryClient, onUpdate])

  return {
    isEnabled: enabled,
  }
}
