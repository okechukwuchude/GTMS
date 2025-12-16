import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication (optional - uncomment if you want to require auth)
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

    // Fetch all active ports, sorted alphabetically by name
    const { data: ports, error: portsError } = await supabase
      .from('ports')
      .select('id, name, code, country_code, city, status')
      .eq('status', 'active')
      .order('name', { ascending: true })

    if (portsError) {
      console.error('Error fetching ports:', portsError)
      return NextResponse.json(
        { error: 'Failed to fetch ports' },
        { status: 500 }
      )
    }

    return NextResponse.json(ports, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in ports API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
