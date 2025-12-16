import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Database table types
type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// User type enum
export type UserType = 'public' | 'staff'

// Registration data for new users
export interface RegisterData {
  email: string
  password: string
  full_name: string
  user_type: UserType
  phone?: string
  company_name?: string
  company_registration?: string
  address?: string
  country_code?: string
}

// Login credentials
export interface LoginCredentials {
  email: string
  password: string
}

// Combined user data (Supabase auth user + profile)
export interface AuthUser {
  id: string
  email: string
  user_type: UserType
  full_name: string
  phone: string | null
  company_name: string | null
  company_registration: string | null
  company_verified: boolean
  address: string | null
  country_code: string | null
  preferred_language: string
  notification_preferences: {
    email: boolean
    sms: boolean
    push: boolean
  }
  avatar_url: string | null
  created_at: string
  updated_at: string
  last_login_at: string | null
}

// Auth session data
export interface AuthSession {
  user: AuthUser | null
  access_token: string | null
  refresh_token: string | null
  expires_at: number | null
}

// Auth state for the application
export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

// Profile update data
export interface ProfileUpdateData {
  full_name?: string
  phone?: string
  company_name?: string
  company_registration?: string
  address?: string
  country_code?: string
  preferred_language?: string
  notification_preferences?: {
    email?: boolean
    sms?: boolean
    push?: boolean
  }
  avatar_url?: string
}

// Password reset request
export interface PasswordResetRequest {
  email: string
}

// Password reset confirmation
export interface PasswordResetConfirm {
  password: string
  token: string
}

// Auth error response
export interface AuthError {
  message: string
  status?: number
  code?: string
}

// Auth response
export interface AuthResponse {
  user: AuthUser | null
  session: AuthSession | null
  error: AuthError | null
}

// Type guards
export function isPublicUser(user: AuthUser): boolean {
  return user.user_type === 'public'
}

export function isStaffUser(user: AuthUser): boolean {
  return user.user_type === 'staff'
}

// Helper to convert Supabase user + profile to AuthUser
export function toAuthUser(supabaseUser: SupabaseUser, profile: Profile): AuthUser {
  return {
    id: supabaseUser.id,
    email: profile.email,
    user_type: profile.user_type,
    full_name: profile.full_name,
    phone: profile.phone,
    company_name: profile.company_name,
    company_registration: profile.company_registration,
    company_verified: profile.company_verified,
    address: profile.address,
    country_code: profile.country_code,
    preferred_language: profile.preferred_language,
    notification_preferences: profile.notification_preferences as {
      email: boolean
      sms: boolean
      push: boolean
    },
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    last_login_at: profile.last_login_at,
  }
}
