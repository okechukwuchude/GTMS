/**
 * Vessels API Routes
 * GET /api/vessels - List all vessels with filtering
 * POST /api/vessels - Create new vessel (staff only)
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/vessels
 * List all vessels with optional filtering
 * Query params: status, mmsi, imo, search, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const mmsi = searchParams.get('mmsi')
    const imo = searchParams.get('imo')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query (simplified - no joins for now)
    let query = supabase
      .from('vessels')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (mmsi) {
      query = query.eq('mmsi', mmsi)
    }
    if (imo) {
      query = query.eq('imo_number', imo)
    }
    if (search) {
      query = query.or(
        `vessel_name.ilike.%${search}%,mmsi.ilike.%${search}%,imo_number.ilike.%${search}%`
      )
    }

    const { data: vessels, error, count } = await query

    if (error) {
      console.error('[Vessels API] Error fetching vessels:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      vessels,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    })
  } catch (error) {
    console.error('[Vessels API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/vessels
 * Create new vessel (staff only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.user_type !== 'staff') {
      return NextResponse.json(
        { error: 'Forbidden - Staff access required' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.vessel_name) {
      return NextResponse.json(
        { error: 'vessel_name is required' },
        { status: 400 }
      )
    }

    // Create vessel
    const { data: vessel, error } = await supabase
      .from('vessels')
      .insert({
        ...body,
        created_by: session.user.id,
        updated_by: session.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('[Vessels API] Error creating vessel:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ vessel }, { status: 201 })
  } catch (error) {
    console.error('[Vessels API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
