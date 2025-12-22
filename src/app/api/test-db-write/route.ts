/**
 * Test Database Write
 * Tests if we can write to the vessels table
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Try to insert a test vessel
    const testVessel = {
      mmsi: '999999999',
      vessel_name: 'TEST VESSEL - DELETE ME',
      status: 'active',
      current_latitude: 51.9225,
      current_longitude: 4.47917,
      ais_data_source: 'test',
    }

    console.log('[Test] Attempting to insert test vessel...')

    const { data, error } = await supabase
      .from('vessels')
      .insert(testVessel)
      .select()
      .single()

    if (error) {
      console.error('[Test] Insert failed:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
    }

    console.log('[Test] Insert successful:', data)

    // Clean up - delete the test vessel
    await supabase.from('vessels').delete().eq('mmsi', '999999999')

    return NextResponse.json({
      success: true,
      message: 'Successfully wrote to and deleted from vessels table',
      insertedData: data,
    })
  } catch (error: any) {
    console.error('[Test] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
