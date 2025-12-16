import { z } from 'zod'

/**
 * ISO 6346 Container Number Format: 4 letters + 7 digits
 * Example: ABCD1234567
 */
const containerNumberRegex = /^[A-Z]{4}\d{7}$/

/**
 * Container type enum
 */
const containerTypeEnum = z.enum([
  '20FT',
  '40FT',
  '40FT_HC',
  '45FT',
  'REEFER',
  'TANK',
  'OPEN_TOP',
  'FLAT_RACK',
])

/**
 * Container status enum
 */
const containerStatusEnum = z.enum([
  'registered',
  'in_transit',
  'arrived',
  'pending_inspection',
  'under_inspection',
  'inspection_complete',
  'cleared',
  'detained',
  'released',
  'departed',
])

/**
 * Hazard class enum (UN hazard classes)
 */
const hazardClassEnum = z.enum([
  'Class 1 - Explosives',
  'Class 2 - Gases',
  'Class 3 - Flammable Liquids',
  'Class 4 - Flammable Solids',
  'Class 5 - Oxidizing Substances',
  'Class 6 - Toxic Substances',
  'Class 7 - Radioactive Material',
  'Class 8 - Corrosive Substances',
  'Class 9 - Miscellaneous Dangerous Goods',
])

/**
 * Container creation schema
 * Includes ALL required database fields
 */
export const containerCreateSchema = z
  .object({
    // Container Details - REQUIRED
    container_number: z
      .string()
      .min(1, 'Container number is required')
      .regex(
        containerNumberRegex,
        'Container number must be in ISO 6346 format (4 letters + 7 digits)'
      )
      .toUpperCase(),
    bill_of_lading: z
      .string()
      .min(1, 'Bill of Lading is required')
      .max(100, 'Bill of Lading must be less than 100 characters'),
    seal_number: z.string().max(50).optional(),
    container_type: containerTypeEnum,

    // Shipper Information - REQUIRED
    shipper_name: z
      .string()
      .min(1, 'Shipper name is required')
      .max(255, 'Shipper name must be less than 255 characters'),
    shipper_address: z.string().max(500).optional(),
    shipper_country: z.string().max(100).optional(),

    // Consignee Information - REQUIRED
    consignee_name: z
      .string()
      .min(1, 'Consignee name is required')
      .max(255, 'Consignee name must be less than 255 characters'),
    consignee_address: z.string().max(500).optional(),
    consignee_country: z.string().max(100).optional(),

    // Cargo Information - REQUIRED
    cargo_description: z
      .string()
      .min(1, 'Cargo description is required')
      .max(1000, 'Cargo description must be less than 1000 characters'),
    commodity_type: z.string().max(100).optional(),
    hs_code: z.string().max(20).optional(),
    quantity: z.number().positive().optional(),
    quantity_unit: z.string().max(20).optional(),
    weight_kg: z.number().positive('Weight must be a positive number').optional(),
    volume_cbm: z.number().positive('Volume must be a positive number').optional(),
    value_usd: z.number().positive('Value must be a positive number').optional(),
    currency: z.string().max(3).default('USD'),

    // Hazardous Material
    is_hazardous: z.boolean().default(false),
    hazard_class: hazardClassEnum.optional(),

    // Ports and Schedule
    origin_port_id: z.string().uuid('Invalid origin port ID').optional(),
    destination_port_id: z.string().uuid('Invalid destination port ID').optional(),
    eta: z.string().datetime().optional(),
    temperature_celsius: z
      .number()
      .min(-50, 'Temperature must be above -50°C')
      .max(50, 'Temperature must be below 50°C')
      .optional(),
  })
  .refine(
    (data) => {
      // If hazardous, hazard_class is required
      if (data.is_hazardous && !data.hazard_class) {
        return false
      }
      return true
    },
    {
      message: 'Hazard class is required for hazardous materials',
      path: ['hazard_class'],
    }
  )
  .refine(
    (data) => {
      // If REEFER type, temperature should be provided
      if (data.container_type === 'REEFER' && data.temperature_celsius === undefined) {
        return false
      }
      return true
    },
    {
      message: 'Temperature is required for REEFER containers',
      path: ['temperature_celsius'],
    }
  )

/**
 * Container update schema (partial of create)
 * All fields optional except those that shouldn't be changed
 */
export const containerUpdateSchema = containerCreateSchema
  .partial()
  .omit({
    // Don't allow changing container number after creation
    container_number: true,
  })
  .extend({
    // Allow status updates
    status: containerStatusEnum.optional(),
    // Allow risk level updates
    risk_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  })

/**
 * Container filter schema for list queries
 */
export const containerFilterSchema = z.object({
  search: z.string().optional(),
  statuses: z.array(containerStatusEnum).optional(),
  originPortId: z.string().uuid().optional(),
  destinationPortId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  isHazardous: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z
    .enum(['registration_date', 'eta', 'container_number', 'status'])
    .default('registration_date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * Container status update schema
 */
export const containerStatusUpdateSchema = z.object({
  status: containerStatusEnum,
  notes: z.string().max(500).optional(),
})

/**
 * Type exports
 */
export type ContainerCreateInput = z.infer<typeof containerCreateSchema>
export type ContainerUpdateInput = z.infer<typeof containerUpdateSchema>
export type ContainerFilterInput = z.infer<typeof containerFilterSchema>
export type ContainerStatusUpdateInput = z.infer<typeof containerStatusUpdateSchema>
