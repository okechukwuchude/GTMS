/**
 * Direct database query test
 * Bypasses PostgREST to test if vessels table actually has data
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 500 }
      )
    }

    // Use raw SQL query via fetch to Supabase's direct database URL
    // This bypasses PostgREST entirely
    const result = await fetch(databaseUrl.replace('postgresql://', 'https://').replace(':5432', ''), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'SELECT COUNT(*) as count, MAX(updated_at) as last_update FROM vessels',
      }),
    })

    return NextResponse.json({
      message: 'Direct DB query (this would need proper pg client)',
      databaseUrlConfigured: !!databaseUrl,
      suggestion: 'Check Supabase SQL Editor: SELECT COUNT(*) FROM vessels;',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to query database', details: error },
      { status: 500 }
    )
  }
}
