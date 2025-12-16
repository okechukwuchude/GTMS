import { createClient } from '@/lib/supabase/server'
import { registerSchema } from '@/lib/validations/auth.validations'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate request data
    const validatedData = registerSchema.parse(body)

    // Create Supabase client
    const supabase = await createClient()

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.full_name,
          user_type: validatedData.user_type,
          phone: validatedData.phone || null,
          company_name: validatedData.company_name || null,
          company_registration: validatedData.company_registration || null,
          address: validatedData.address || null,
          country_code: validatedData.country_code || null,
        },
      },
    })

    if (authError) {
      // Handle Supabase auth errors
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Email is already registered' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json(
      {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      },
      { status: 201 }
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
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    )
  }
}
