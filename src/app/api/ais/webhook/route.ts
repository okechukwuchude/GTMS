/**
 * AIS Stream Webhook Handler
 * POST /api/ais/webhook - Receive AIS position updates from backend WebSocket client
 *
 * Note: This endpoint receives position updates from our own backend WebSocket client
 * that connects to AIS Stream. It's not a direct webhook from AIS Stream (they don't
 * provide webhooks - we maintain a persistent WebSocket connection instead).
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { ParsedVesselPosition } from '@/lib/ais-stream/types'

export const dynamic = 'force-dynamic'

/**
 * POST /api/ais/webhook
 * Receive vessel position updates from AIS Stream WebSocket client
 *
 * Expected body: ParsedVesselPosition from AIS Stream parser
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify request (in production, add API key or signature verification)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.AIS_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const position: ParsedVesselPosition = await request.json()

    // Validate required fields
    if (!position.mmsi || !position.latitude || !position.longitude) {
      return NextResponse.json(
        { error: 'mmsi, latitude, and longitude are required' },
        { status: 400 }
      )
    }

    // Find vessel by MMSI
    const { data: vessel, error: vesselError } = await supabase
      .from('vessels')
      .select('id')
      .eq('mmsi', position.mmsi)
      .single()

    if (vesselError || !vessel) {
      // Vessel not in our database - we can either:
      // 1. Ignore it (only track vessels we care about)
      // 2. Auto-create vessel record (for comprehensive tracking)
      // For now, we'll ignore unknown vessels
      console.log(`[AIS Webhook] Unknown vessel MMSI: ${position.mmsi}`)
      return NextResponse.json({ message: 'Vessel not tracked' }, { status: 200 })
    }

    // Insert position record
    const { error: positionError } = await supabase
      .from('vessel_positions')
      .insert({
        vessel_id: vessel.id,
        latitude: position.latitude,
        longitude: position.longitude,
        speed_knots: position.speedKnots,
        course_over_ground: position.courseOverGround,
        heading: position.heading,
        navigation_status: position.navigationStatus,
        timestamp: position.timestamp,
        data_source: 'aisstream',
        message_type: 'PositionReport',
        raw_ais_data: position.rawMessage,
      })

    if (positionError) {
      console.error('[AIS Webhook] Error inserting position:', positionError)
      // Don't fail - continue to update vessel
    }

    // Update vessel's current position
    const { error: updateError } = await supabase
      .from('vessels')
      .update({
        current_latitude: position.latitude,
        current_longitude: position.longitude,
        current_speed_knots: position.speedKnots,
        current_course: position.courseOverGround,
        current_heading: position.heading,
        navigation_status: position.navigationStatus,
        last_position_update: position.timestamp,
        last_ais_message: position.rawMessage,
      })
      .eq('id', vessel.id)

    if (updateError) {
      console.error('[AIS Webhook] Error updating vessel:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      vessel_id: vessel.id,
      mmsi: position.mmsi,
    })
  } catch (error) {
    console.error('[AIS Webhook] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
