import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'

interface DashboardStats {
  totalContainers: number
  inTransit: number
  cleared: number
  highRisk: number
}

export async function GET() {
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

    // Get total containers count (all statuses)
    const { count: totalContainers, error: totalError } = await supabase
      .from('containers')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)

    if (totalError) {
      console.error('Error fetching total containers:', totalError)
      return NextResponse.json(
        { error: 'Failed to fetch total containers' },
        { status: 500 }
      )
    }

    // Get in transit containers (in_transit + arrived)
    const { count: inTransit, error: inTransitError } = await supabase
      .from('containers')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .in('status', ['in_transit', 'arrived'])

    if (inTransitError) {
      console.error('Error fetching in transit containers:', inTransitError)
      return NextResponse.json(
        { error: 'Failed to fetch in transit containers' },
        { status: 500 }
      )
    }

    // Get cleared containers (cleared + released)
    const { count: cleared, error: clearedError } = await supabase
      .from('containers')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .in('status', ['cleared', 'released'])

    if (clearedError) {
      console.error('Error fetching cleared containers:', clearedError)
      return NextResponse.json(
        { error: 'Failed to fetch cleared containers' },
        { status: 500 }
      )
    }

    // Get high risk containers (detained + pending_inspection)
    const { count: highRisk, error: highRiskError } = await supabase
      .from('containers')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .in('status', ['detained', 'pending_inspection'])

    if (highRiskError) {
      console.error('Error fetching high risk containers:', highRiskError)
      return NextResponse.json(
        { error: 'Failed to fetch high risk containers' },
        { status: 500 }
      )
    }

    const stats: DashboardStats = {
      totalContainers: totalContainers || 0,
      inTransit: inTransit || 0,
      cleared: cleared || 0,
      highRisk: highRisk || 0,
    }

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in dashboard stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
