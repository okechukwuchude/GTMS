import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validations/auth.validations'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate request data
    const validatedData = loginSchema.parse(body)

    // Create Supabase client
    const supabase = await createClient()

    // Authenticate user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      // Handle authentication errors
      if (authError.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Please verify your email address before logging in' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      )
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    // Update last login timestamp
    await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id)

    // Return success response with user and session data
    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: authData.user.id,
          email: profile.email,
          user_type: profile.user_type,
          full_name: profile.full_name,
          phone: profile.phone,
          company_name: profile.company_name,
          company_verified: profile.company_verified,
          avatar_url: profile.avatar_url,
        },
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Handle unexpected errors
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    )
  }
}
