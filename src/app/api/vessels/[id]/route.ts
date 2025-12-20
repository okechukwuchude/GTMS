/**
 * Single Vessel API Routes
 * GET /api/vessels/[id] - Get vessel details
 * PUT /api/vessels/[id] - Update vessel (staff only)
 * DELETE /api/vessels/[id] - Delete vessel (staff only)
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/vessels/[id]
 * Get vessel details with current position and route
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

    // Fetch vessel with related data
    const { data: vessel, error } = await supabase
      .from('vessels')
      .select(
        `
        *,
        current_port:ports!vessels_current_port_id_fkey(id, name, code, latitude, longitude),
        destination_port:ports!vessels_destination_port_id_fkey(id, name, code, latitude, longitude)
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Vessel not found' }, { status: 404 })
      }
      console.error('[Vessel API] Error fetching vessel:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ vessel })
  } catch (error) {
    console.error('[Vessel API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/vessels/[id]
 * Update vessel (staff only)
 */
export async function PUT(
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

    // Update vessel
    const { data: vessel, error } = await supabase
      .from('vessels')
      .update({
        ...body,
        updated_by: session.user.id,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Vessel API] Error updating vessel:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ vessel })
  } catch (error) {
    console.error('[Vessel API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/vessels/[id]
 * Delete vessel (staff only)
 */
export async function DELETE(
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

    // Delete vessel (CASCADE will handle related records)
    const { error } = await supabase.from('vessels').delete().eq('id', id)

    if (error) {
      console.error('[Vessel API] Error deleting vessel:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Vessel API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
