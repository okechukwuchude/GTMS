import { Database } from './database.types'

/**
 * Container table types from database
 */
export type Container = Database['public']['Tables']['containers']['Row']
export type ContainerInsert = Database['public']['Tables']['containers']['Insert']
export type ContainerUpdate = Database['public']['Tables']['containers']['Update']

/**
 * Container status enum
 */
export type ContainerStatus =
  | 'registered'
  | 'in_transit'
  | 'arrived'
  | 'pending_inspection'
  | 'under_inspection'
  | 'inspection_complete'
  | 'cleared'
  | 'detained'
  | 'released'
  | 'departed'

/**
 * Container type enum
 */
export type ContainerType =
  | '20FT'
  | '40FT'
  | '40FT_HC'
  | '45FT'
  | 'REEFER'
  | 'TANK'
  | 'OPEN_TOP'
  | 'FLAT_RACK'

/**
 * Risk level enum
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

/**
 * Port information type
 */
export type Port = Database['public']['Tables']['ports']['Row']

/**
 * Container with populated relationships
 */
export interface ContainerWithRelations extends Container {
  origin_port?: Port | null
  destination_port?: Port | null
  owner?: {
    id: string
    email: string
    full_name: string
    user_type: string
  } | null
}

/**
 * Container form data for registration/editing
 */
export interface ContainerFormData {
  // Basic Information
  container_number: string
  bill_of_lading: string
  seal_number?: string
  container_type: ContainerType

  // Shipper Information
  shipper_name: string
  shipper_address?: string
  shipper_country?: string

  // Consignee Information
  consignee_name: string
  consignee_address?: string
  consignee_country?: string

  // Cargo Information
  cargo_description: string
  commodity_type?: string
  hs_code?: string
  quantity?: number
  quantity_unit?: string
  weight_kg?: number
  volume_cbm?: number
  value_usd?: number
  currency?: string

  // Hazardous Material
  is_hazardous: boolean
  hazard_class?: string

  // Vessel Information
  vessel_name?: string
  vessel_mmsi?: string

  // Ports and Schedule
  origin_port?: string
  destination_port?: string
  eta?: string
  temperature_celsius?: number
}

/**
 * Container filters for list view
 */
export interface ContainerFilters {
  search?: string
  statuses?: ContainerStatus[]
  originPort?: string
  destinationPort?: string
  dateFrom?: string
  dateTo?: string
  riskLevel?: RiskLevel
  isHazardous?: boolean
  page?: number
  limit?: number
  sortBy?: 'registration_date' | 'eta' | 'container_number' | 'status'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated container list response
 */
export interface ContainerListResponse {
  data: ContainerWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Container status history
 */
export type ContainerStatusHistory =
  Database['public']['Tables']['container_status_history']['Row']

/**
 * Container status history with user details
 */
export interface ContainerStatusHistoryWithUser extends ContainerStatusHistory {
  changed_by_user?: {
    id: string
    full_name: string
    email: string
  } | null
}

/**
 * Container statistics
 */
export interface ContainerStats {
  totalContainers: number
  byStatus: Record<ContainerStatus, number>
  byRiskLevel: Record<RiskLevel, number>
  inTransit: number
  cleared: number
  detained: number
}
