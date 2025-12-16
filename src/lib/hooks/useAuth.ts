'use client'

import { createClient } from '@/lib/supabase/client'
import type {
  AuthUser,
  LoginCredentials,
  RegisterData,
} from '@/types/auth.types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser({
              id: session.user.id,
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
            })
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch profile on sign in
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser({
            id: session.user.id,
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
          })
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // User state will be updated via onAuthStateChange
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      // Redirect to login page after successful registration
      router.push('/auth/login?registered=true')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      // User state will be updated via onAuthStateChange
      router.push('/auth/login')
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    clearError,
  }
}
