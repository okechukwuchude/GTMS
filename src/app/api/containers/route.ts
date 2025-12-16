import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { containerCreateSchema } from '@/lib/validations/container.validations'
import { ZodError } from 'zod'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'

/**
 * GET /api/containers
 * List containers with server-side pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined
    const statusParam = searchParams.get('status')
    const statuses = statusParam ? statusParam.split(',') : undefined
    const originPortId = searchParams.get('origin_port_id') || undefined
    const destinationPortId = searchParams.get('destination_port_id') || undefined
    const dateFrom = searchParams.get('date_from') || undefined
    const dateTo = searchParams.get('date_to') || undefined

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('containers')
      .select(
        `
        *,
        origin_port:origin_port_id(id, name, code, country_code, city),
        destination_port:destination_port_id(id, name, code, country_code, city)
      `,
        { count: 'exact' }
      )
      .eq('owner_id', userId)

    // Apply filters
    if (search) {
      query = query.or(
        `container_number.ilike.%${search}%,bill_of_lading.ilike.%${search}%,cargo_description.ilike.%${search}%`
      )
    }

    if (statuses && statuses.length > 0) {
      query = query.in('status', statuses)
    }

    if (originPortId) {
      query = query.eq('origin_port_id', originPortId)
    }

    if (destinationPortId) {
      query = query.eq('destination_port_id', destinationPortId)
    }

    if (dateFrom) {
      query = query.gte('registration_date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('registration_date', dateTo)
    }

    // Apply sorting and pagination
    query = query
      .order('registration_date', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: containers, error: containersError, count } = await query

    if (containersError) {
      console.error('Error fetching containers:', containersError)
      return NextResponse.json(
        { error: 'Failed to fetch containers' },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json(
      {
        data: containers || [],
        total: count || 0,
        page,
        limit,
        totalPages,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in containers GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/containers
 * Create a new container
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Parse and validate request body
    const body = await request.json()
    const validatedData = containerCreateSchema.parse(body)

    // Create container with auto-filled fields
    const containerData = {
      ...validatedData,
      owner_id: userId,
      created_by: userId,
      status: 'registered' as const,
      registration_date: new Date().toISOString(),
      risk_level: 'low' as const, // Default risk level
    }

    const { data: container, error: createError } = await supabase
      .from('containers')
      .insert(containerData)
      .select(
        `
        *,
        origin_port:origin_port_id(id, name, code, country_code, city),
        destination_port:destination_port_id(id, name, code, country_code, city)
      `
      )
      .single()

    if (createError) {
      console.error('Error creating container:', createError)

      // Check for unique constraint violation
      if (createError.code === '23505') {
        return NextResponse.json(
          { error: 'Container with this number already exists' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to create container' },
        { status: 500 }
      )
    }

    // Create initial status history entry
    const { error: historyError } = await supabase
      .from('container_status_history')
      .insert({
        container_id: container.id,
        old_status: null,
        new_status: 'registered',
        changed_by: userId,
        notes: 'Container registered',
      })

    if (historyError) {
      console.error('Error creating status history:', historyError)
      // Don't fail the request, but log the error
    }

    return NextResponse.json(container, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    console.error('Unexpected error in containers POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
