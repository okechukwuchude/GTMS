import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'

/**
 * GET /api/containers/[id]/history
 * Fetch status history for a container
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
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { id: containerId } = params

    // First, verify that the user owns this container
    const { data: container, error: containerError } = await supabase
      .from('containers')
      .select('id, owner_id')
      .eq('id', containerId)
      .eq('owner_id', userId)
      .single()

    if (containerError || !container) {
      return NextResponse.json(
        { error: 'Container not found' },
        { status: 404 }
      )
    }

    // Fetch status history with user details
    const { data: history, error: historyError } = await supabase
      .from('container_status_history')
      .select(
        `
        *,
        changed_by_user:changed_by(id, full_name, email)
      `
      )
      .eq('container_id', containerId)
      .order('created_at', { ascending: false })

    if (historyError) {
      console.error('Error fetching container history:', historyError)
      return NextResponse.json(
        { error: 'Failed to fetch container history' },
        { status: 500 }
      )
    }

    return NextResponse.json(history || [], { status: 200 })
  } catch (error) {
    console.error('Unexpected error in container history API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
