/**
 * Vessel Positions API Routes
 * GET /api/vessels/[id]/positions - Get position history
 * POST /api/vessels/[id]/positions - Add new position (from AIS Stream)
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/vessels/[id]/positions
 * Get vessel position history
 * Query params: limit, offset, since (ISO timestamp)
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
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const since = searchParams.get('since') // ISO timestamp

    // Build query
    let query = supabase
      .from('vessel_positions')
      .select('*, port:ports(id, name, code)', { count: 'exact' })
      .eq('vessel_id', id)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by time if provided
    if (since) {
      query = query.gte('timestamp', since)
    }

    const { data: positions, error, count } = await query

    if (error) {
      console.error('[Vessel Positions API] Error fetching positions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      positions,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    })
  } catch (error) {
    console.error('[Vessel Positions API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/vessels/[id]/positions
 * Add new position update (typically from AIS Stream webhook)
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

    const { id } = params
    const body = await request.json()

    // Validate required fields
    if (!body.latitude || !body.longitude || !body.timestamp) {
      return NextResponse.json(
        { error: 'latitude, longitude, and timestamp are required' },
        { status: 400 }
      )
    }

    // Insert position record
    const { data: position, error: positionError } = await supabase
      .from('vessel_positions')
      .insert({
        vessel_id: id,
        latitude: body.latitude,
        longitude: body.longitude,
        speed_knots: body.speed_knots,
        course_over_ground: body.course_over_ground,
        heading: body.heading,
        navigation_status: body.navigation_status,
        port_id: body.port_id,
        distance_to_port_km: body.distance_to_port_km,
        timestamp: body.timestamp,
        data_source: body.data_source || 'aisstream',
        message_type: body.message_type,
        raw_ais_data: body.raw_ais_data,
      })
      .select()
      .single()

    if (positionError) {
      console.error('[Vessel Positions API] Error creating position:', positionError)
      return NextResponse.json(
        { error: positionError.message },
        { status: 500 }
      )
    }

    // Update vessel's current position
    const { error: vesselError } = await supabase
      .from('vessels')
      .update({
        current_latitude: body.latitude,
        current_longitude: body.longitude,
        current_speed_knots: body.speed_knots,
        current_course: body.course_over_ground,
        current_heading: body.heading,
        navigation_status: body.navigation_status,
        current_port_id: body.port_id,
        last_position_update: body.timestamp,
        last_ais_message: body.raw_ais_data,
      })
      .eq('id', id)

    if (vesselError) {
      console.error('[Vessel Positions API] Error updating vessel:', vesselError)
      // Don't fail the request, position was saved
    }

    return NextResponse.json({ position }, { status: 201 })
  } catch (error) {
    console.error('[Vessel Positions API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
