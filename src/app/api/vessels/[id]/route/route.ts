/**
 * Vessel Route API Routes
 * GET /api/vessels/[id]/route - Get vessel's active/planned route
 * POST /api/vessels/[id]/route - Create/update vessel route (staff only)
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/vessels/[id]/route
 * Get vessel's route (active or planned)
 * Query params: type (active, planned, completed)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'active'

    // Fetch route
    const { data: routes, error } = await supabase
      .from('vessel_routes')
      .select(
        `
        *,
        origin_port:ports!vessel_routes_origin_port_id_fkey(id, name, code, latitude, longitude),
        destination_port:ports!vessel_routes_destination_port_id_fkey(id, name, code, latitude, longitude)
      `
      )
      .eq('vessel_id', id)
      .eq('route_type', type)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Vessel Route API] Error fetching route:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ routes })
  } catch (error) {
    console.error('[Vessel Route API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/vessels/[id]/route
 * Create or update vessel route (staff only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const body = await request.json()

    // Validate required fields
    if (!body.coordinates || !Array.isArray(body.coordinates)) {
      return NextResponse.json(
        { error: 'coordinates array is required' },
        { status: 400 }
      )
    }

    // Create route
    const { data: route, error } = await supabase
      .from('vessel_routes')
      .insert({
        vessel_id: id,
        route_name: body.route_name,
        origin_port_id: body.origin_port_id,
        destination_port_id: body.destination_port_id,
        route_type: body.route_type || 'planned',
        coordinates: body.coordinates,
        total_distance_km: body.total_distance_km,
        departure_time: body.departure_time,
        estimated_arrival: body.estimated_arrival,
        actual_arrival: body.actual_arrival,
        waypoints: body.waypoints,
        intermediate_ports: body.intermediate_ports,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('[Vessel Route API] Error creating route:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ route }, { status: 201 })
  } catch (error) {
    console.error('[Vessel Route API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
