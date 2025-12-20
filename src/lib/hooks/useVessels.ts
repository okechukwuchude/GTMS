/**
 * Vessel React Query Hooks
 * Hooks for fetching and managing vessel data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

// ============================================================================
// Types
// ============================================================================

export interface Vessel {
  id: string
  imo_number: string | null
  mmsi: string | null
  vessel_name: string
  call_sign: string | null
  vessel_type: string | null
  vessel_type_code: number | null
  flag_country: string | null
  gross_tonnage: number | null
  net_tonnage: number | null
  deadweight_tonnage: number | null
  built_year: number | null
  length_meters: number | null
  beam_meters: number | null
  draft_meters: number | null
  owner_name: string | null
  operator_name: string | null
  manager_name: string | null
  status: 'active' | 'inactive' | 'in_transit' | 'at_berth' | 'anchored' | 'under_repair' | 'decommissioned'
  current_latitude: number | null
  current_longitude: number | null
  current_speed_knots: number | null
  current_course: number | null
  current_heading: number | null
  navigation_status: number | null
  current_port_id: string | null
  destination_port_id: string | null
  destination_name: string | null
  eta: string | null
  last_position_update: string | null
  ais_data_source: string | null
  position_update_frequency_seconds: number | null
  last_ais_message: any | null
  created_at: string
  updated_at: string
  current_port?: {
    id: string
    name: string
    code: string
    latitude: number
    longitude: number
  }
  destination_port?: {
    id: string
    name: string
    code: string
    latitude: number
    longitude: number
  }
}

export interface VesselPosition {
  id: string
  vessel_id: string
  latitude: number
  longitude: number
  speed_knots: number | null
  course_over_ground: number | null
  heading: number | null
  navigation_status: number | null
  port_id: string | null
  distance_to_port_km: number | null
  timestamp: string
  data_source: string
  message_type: string | null
  raw_ais_data: any | null
  created_at: string
  port?: {
    id: string
    name: string
    code: string
  }
}

export interface VesselRoute {
  id: string
  vessel_id: string
  route_name: string | null
  origin_port_id: string | null
  destination_port_id: string | null
  route_type: 'planned' | 'active' | 'completed' | 'cancelled'
  coordinates: Array<{ lat: number; lng: number }>
  total_distance_km: number | null
  departure_time: string | null
  estimated_arrival: string | null
  actual_arrival: string | null
  waypoints: any | null
  intermediate_ports: string[] | null
  created_at: string
  updated_at: string
  origin_port?: {
    id: string
    name: string
    code: string
    latitude: number
    longitude: number
  }
  destination_port?: {
    id: string
    name: string
    code: string
    latitude: number
    longitude: number
  }
}

export interface VesselsFilters {
  status?: string
  mmsi?: string
  imo?: string
  search?: string
  limit?: number
  offset?: number
}

export interface VesselsResponse {
  vessels: Vessel[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

// ============================================================================
// Query Keys
// ============================================================================

export const vesselKeys = {
  all: ['vessels'] as const,
  lists: () => [...vesselKeys.all, 'list'] as const,
  list: (filters: VesselsFilters) => [...vesselKeys.lists(), filters] as const,
  details: () => [...vesselKeys.all, 'detail'] as const,
  detail: (id: string) => [...vesselKeys.details(), id] as const,
  positions: (id: string) => [...vesselKeys.detail(id), 'positions'] as const,
  routes: (id: string) => [...vesselKeys.detail(id), 'routes'] as const,
  containers: (id: string) => [...vesselKeys.detail(id), 'containers'] as const,
}

// ============================================================================
// Hooks - Queries
// ============================================================================

/**
 * Fetch list of vessels with filtering
 */
export function useVessels(filters: VesselsFilters = {}) {
  return useQuery<VesselsResponse>({
    queryKey: vesselKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.mmsi) params.append('mmsi', filters.mmsi)
      if (filters.imo) params.append('imo', filters.imo)
      if (filters.search) params.append('search', filters.search)
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`/api/vessels?${params.toString()}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch vessels')
      }
      return response.json()
    },
  })
}

/**
 * Fetch single vessel by ID
 */
export function useVessel(id: string | null) {
  return useQuery<{ vessel: Vessel }>({
    queryKey: vesselKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Vessel ID is required')
      const response = await fetch(`/api/vessels/${id}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch vessel')
      }
      return response.json()
    },
    enabled: !!id,
  })
}

/**
 * Fetch vessel position history
 */
export function useVesselPositions(
  vesselId: string | null,
  options: { limit?: number; offset?: number; since?: string } = {}
) {
  return useQuery<{ positions: VesselPosition[]; pagination: any }>({
    queryKey: [...vesselKeys.positions(vesselId || ''), options],
    queryFn: async () => {
      if (!vesselId) throw new Error('Vessel ID is required')
      const params = new URLSearchParams()
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.offset) params.append('offset', options.offset.toString())
      if (options.since) params.append('since', options.since)

      const response = await fetch(`/api/vessels/${vesselId}/positions?${params.toString()}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch positions')
      }
      return response.json()
    },
    enabled: !!vesselId,
  })
}

/**
 * Fetch vessel routes
 */
export function useVesselRoutes(
  vesselId: string | null,
  type: 'active' | 'planned' | 'completed' = 'active'
) {
  return useQuery<{ routes: VesselRoute[] }>({
    queryKey: [...vesselKeys.routes(vesselId || ''), type],
    queryFn: async () => {
      if (!vesselId) throw new Error('Vessel ID is required')
      const response = await fetch(`/api/vessels/${vesselId}/route?type=${type}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch routes')
      }
      return response.json()
    },
    enabled: !!vesselId,
  })
}

/**
 * Fetch containers on vessel
 */
export function useVesselContainers(
  vesselId: string | null,
  status?: string
) {
  return useQuery({
    queryKey: [...vesselKeys.containers(vesselId || ''), status],
    queryFn: async () => {
      if (!vesselId) throw new Error('Vessel ID is required')
      const params = status ? `?status=${status}` : ''
      const response = await fetch(`/api/vessels/${vesselId}/containers${params}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch containers')
      }
      return response.json()
    },
    enabled: !!vesselId,
  })
}

// ============================================================================
// Hooks - Mutations
// ============================================================================

/**
 * Create new vessel
 */
export function useCreateVessel() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Partial<Vessel>) => {
      const response = await fetch('/api/vessels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create vessel')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vesselKeys.lists() })
      toast({
        title: 'Vessel created',
        description: 'Vessel has been successfully created',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating vessel',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

/**
 * Update vessel
 */
export function useUpdateVessel() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vessel> }) => {
      const response = await fetch(`/api/vessels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update vessel')
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vesselKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: vesselKeys.lists() })
      toast({
        title: 'Vessel updated',
        description: 'Vessel has been successfully updated',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating vessel',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

/**
 * Delete vessel
 */
export function useDeleteVessel() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vessels/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete vessel')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vesselKeys.lists() })
      toast({
        title: 'Vessel deleted',
        description: 'Vessel has been successfully deleted',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting vessel',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

/**
 * Add position update to vessel
 */
export function useAddVesselPosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ vesselId, data }: { vesselId: string; data: any }) => {
      const response = await fetch(`/api/vessels/${vesselId}/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add position')
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vesselKeys.positions(variables.vesselId) })
      queryClient.invalidateQueries({ queryKey: vesselKeys.detail(variables.vesselId) })
    },
  })
}

/**
 * Create vessel route
 */
export function useCreateVesselRoute() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ vesselId, data }: { vesselId: string; data: any }) => {
      const response = await fetch(`/api/vessels/${vesselId}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create route')
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vesselKeys.routes(variables.vesselId) })
      toast({
        title: 'Route created',
        description: 'Vessel route has been successfully created',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating route',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

/**
 * Link container to vessel
 */
export function useLinkContainerToVessel() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ vesselId, data }: { vesselId: string; data: any }) => {
      const response = await fetch(`/api/vessels/${vesselId}/containers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to link container')
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vesselKeys.containers(variables.vesselId) })
      toast({
        title: 'Container linked',
        description: 'Container has been successfully linked to vessel',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error linking container',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}
