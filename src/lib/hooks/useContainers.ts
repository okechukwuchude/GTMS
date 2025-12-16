'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import {
  Container,
  ContainerWithRelations,
  ContainerListResponse,
  ContainerFilters,
  ContainerStatusHistoryWithUser,
} from '@/types/container.types'
import {
  ContainerCreateInput,
  ContainerUpdateInput,
} from '@/lib/validations/container.validations'
import { toast } from 'sonner'

/**
 * Fetch containers list with filters and pagination
 */
async function fetchContainers(
  filters: ContainerFilters
): Promise<ContainerListResponse> {
  const params = new URLSearchParams()

  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())
  if (filters.search) params.append('search', filters.search)
  if (filters.statuses && filters.statuses.length > 0) {
    params.append('status', filters.statuses.join(','))
  }
  if (filters.originPortId) params.append('origin_port_id', filters.originPortId)
  if (filters.destinationPortId) {
    params.append('destination_port_id', filters.destinationPortId)
  }
  if (filters.dateFrom) params.append('date_from', filters.dateFrom)
  if (filters.dateTo) params.append('date_to', filters.dateTo)

  const response = await fetch(`/api/containers?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch containers')
  }

  return response.json()
}

/**
 * Fetch a single container by ID
 */
async function fetchContainer(id: string): Promise<ContainerWithRelations> {
  const response = await fetch(`/api/containers/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch container')
  }

  return response.json()
}

/**
 * Fetch container status history
 */
async function fetchContainerHistory(
  id: string
): Promise<ContainerStatusHistoryWithUser[]> {
  const response = await fetch(`/api/containers/${id}/history`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch container history')
  }

  return response.json()
}

/**
 * Create a new container
 */
async function createContainer(
  data: ContainerCreateInput
): Promise<ContainerWithRelations> {
  const response = await fetch('/api/containers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create container')
  }

  return response.json()
}

/**
 * Update a container
 */
async function updateContainer({
  id,
  data,
}: {
  id: string
  data: ContainerUpdateInput
}): Promise<ContainerWithRelations> {
  const response = await fetch(`/api/containers/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update container')
  }

  return response.json()
}

/**
 * Delete a container
 */
async function deleteContainer(id: string): Promise<void> {
  const response = await fetch(`/api/containers/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete container')
  }
}

/**
 * Hook to fetch containers list
 */
export function useContainerList(filters: ContainerFilters = {}) {
  return useQuery({
    queryKey: queryKeys.containers.list(filters),
    queryFn: () => fetchContainers(filters),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch a single container
 */
export function useContainerDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.containers.detail(id),
    queryFn: () => fetchContainer(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to fetch container status history
 */
export function useContainerHistory(id: string) {
  return useQuery({
    queryKey: queryKeys.containers.history(id),
    queryFn: () => fetchContainerHistory(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to create a container
 */
export function useCreateContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createContainer,
    onSuccess: (data) => {
      // Invalidate containers list
      queryClient.invalidateQueries({
        queryKey: queryKeys.containers.lists(),
      })
      // Invalidate dashboard stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.all,
      })
      toast.success('Container created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create container')
    },
  })
}

/**
 * Hook to update a container
 */
export function useUpdateContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateContainer,
    onSuccess: (data, variables) => {
      // Invalidate specific container detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.containers.detail(variables.id),
      })
      // Invalidate container history (if status changed)
      queryClient.invalidateQueries({
        queryKey: queryKeys.containers.history(variables.id),
      })
      // Invalidate containers list
      queryClient.invalidateQueries({
        queryKey: queryKeys.containers.lists(),
      })
      // Invalidate dashboard stats (if status changed)
      if (variables.data.status) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.all,
        })
      }
      toast.success('Container updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update container')
    },
  })
}

/**
 * Hook to delete a container
 */
export function useDeleteContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteContainer,
    onSuccess: (_, deletedId) => {
      // Invalidate containers list
      queryClient.invalidateQueries({
        queryKey: queryKeys.containers.lists(),
      })
      // Remove specific container from cache
      queryClient.removeQueries({
        queryKey: queryKeys.containers.detail(deletedId),
      })
      // Invalidate dashboard stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.all,
      })
      toast.success('Container deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete container')
    },
  })
}
