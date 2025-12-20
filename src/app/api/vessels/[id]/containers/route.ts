/**
 * Vessel Containers API Routes
 * GET /api/vessels/[id]/containers - Get all containers on a vessel
 * POST /api/vessels/[id]/containers - Link container to vessel (staff only)
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/vessels/[id]/containers
 * Get all containers currently on this vessel
 * Query params: status (loaded, in_transit, arrived, unloaded)
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
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('container_vessels')
      .select(
        `
        *,
        container:containers(*),
        loaded_at_port:ports!container_vessels_loaded_at_port_id_fkey(id, name, code),
        unload_at_port:ports!container_vessels_unload_at_port_id_fkey(id, name, code)
      `
      )
      .eq('vessel_id', id)
      .order('loaded_at', { ascending: false })

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: containerVessels, error } = await query

    if (error) {
      console.error('[Vessel Containers API] Error fetching containers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ containerVessels })
  } catch (error) {
    console.error('[Vessel Containers API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/vessels/[id]/containers
 * Link a container to this vessel (staff only)
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

    const { id: vesselId } = params
    const body = await request.json()

    // Validate required fields
    if (!body.container_id) {
      return NextResponse.json(
        { error: 'container_id is required' },
        { status: 400 }
      )
    }

    // Create container-vessel link
    const { data: containerVessel, error } = await supabase
      .from('container_vessels')
      .insert({
        vessel_id: vesselId,
        container_id: body.container_id,
        loaded_at_port_id: body.loaded_at_port_id,
        loaded_at: body.loaded_at || new Date().toISOString(),
        loading_confirmed: body.loading_confirmed || false,
        unload_at_port_id: body.unload_at_port_id,
        estimated_unload_at: body.estimated_unload_at,
        status: body.status || 'loaded',
        bay_position: body.bay_position,
        row_position: body.row_position,
        tier_position: body.tier_position,
        notes: body.notes,
        created_by: session.user.id,
        updated_by: session.user.id,
      })
      .select(
        `
        *,
        container:containers(*),
        loaded_at_port:ports!container_vessels_loaded_at_port_id_fkey(id, name, code),
        unload_at_port:ports!container_vessels_unload_at_port_id_fkey(id, name, code)
      `
      )
      .single()

    if (error) {
      console.error('[Vessel Containers API] Error linking container:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update container's vessel_id for quick lookup
    await supabase
      .from('containers')
      .update({ vessel_id: vesselId })
      .eq('id', body.container_id)

    return NextResponse.json({ containerVessel }, { status: 201 })
  } catch (error) {
    console.error('[Vessel Containers API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
