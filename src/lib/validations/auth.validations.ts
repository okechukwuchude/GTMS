import { z } from 'zod'

// User type enum schema
export const userTypeSchema = z.enum(['public', 'staff'])

// Registration schema
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must be less than 255 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes'),
  user_type: userTypeSchema,
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (use E.164 format)')
    .optional()
    .or(z.literal('')),
  company_name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(255, 'Company name must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  company_registration: z
    .string()
    .max(100, 'Company registration must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  address: z.string().max(500, 'Address must be less than 500 characters').optional().or(z.literal('')),
  country_code: z
    .string()
    .length(3, 'Country code must be exactly 3 characters (ISO 3166-1 alpha-3)')
    .regex(/^[A-Z]{3}$/, 'Country code must be uppercase letters')
    .optional()
    .or(z.literal('')),
})

// Login schema
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Profile update schema
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must be less than 255 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (use E.164 format)')
    .optional()
    .or(z.literal(''))
    .or(z.null()),
  company_name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(255, 'Company name must be less than 255 characters')
    .optional()
    .or(z.literal(''))
    .or(z.null()),
  company_registration: z
    .string()
    .max(100, 'Company registration must be less than 100 characters')
    .optional()
    .or(z.literal(''))
    .or(z.null()),
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .or(z.literal(''))
    .or(z.null()),
  country_code: z
    .string()
    .length(3, 'Country code must be exactly 3 characters (ISO 3166-1 alpha-3)')
    .regex(/^[A-Z]{3}$/, 'Country code must be uppercase letters')
    .optional()
    .or(z.literal(''))
    .or(z.null()),
  preferred_language: z.string().max(10, 'Language code must be less than 10 characters').optional(),
  notification_preferences: z
    .object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
    })
    .optional(),
  avatar_url: z.string().url('Invalid URL format').optional().or(z.literal('')).or(z.null()),
})

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

// Password reset confirm schema
export const passwordResetConfirmSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  token: z.string().min(1, 'Reset token is required'),
})

// Password change schema (for authenticated users)
export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirm_password: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: 'New password must be different from current password',
    path: ['new_password'],
  })

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

// Export inferred types from schemas
export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type PasswordResetRequestFormData = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetConfirmFormData = z.infer<typeof passwordResetConfirmSchema>
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>
export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>
