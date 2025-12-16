/**
 * Query Key Factory for React Query
 *
 * Centralized query keys for consistent cache management and invalidation.
 * Following React Query best practices for hierarchical key structure.
 */

export const queryKeys = {
  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
  },

  // Container queries
  containers: {
    all: ['containers'] as const,
    lists: () => [...queryKeys.containers.all, 'list'] as const,
    list: (filters?: {
      page?: number
      limit?: number
      status?: string[]
      originPortId?: string
      destinationPortId?: string
      search?: string
      dateFrom?: string
      dateTo?: string
    }) => [...queryKeys.containers.lists(), filters] as const,
    details: () => [...queryKeys.containers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.containers.details(), id] as const,
    history: (id: string) => [...queryKeys.containers.detail(id), 'history'] as const,
  },

  // Port queries
  ports: {
    all: ['ports'] as const,
    lists: () => [...queryKeys.ports.all, 'list'] as const,
    list: (filters?: { status?: string }) =>
      [...queryKeys.ports.lists(), filters] as const,
  },

  // User/Profile queries
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
  },
} as const

/**
 * Helper function to invalidate all container-related queries
 * Usage: queryClient.invalidateQueries({ queryKey: queryKeys.containers.all })
 */
export function getContainerQueryKeys() {
  return queryKeys.containers
}

/**
 * Helper function to invalidate all port-related queries
 * Usage: queryClient.invalidateQueries({ queryKey: queryKeys.ports.all })
 */
export function getPortQueryKeys() {
  return queryKeys.ports
}

/**
 * Helper function to invalidate all dashboard queries
 * Usage: queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
 */
export function getDashboardQueryKeys() {
  return queryKeys.dashboard
}
