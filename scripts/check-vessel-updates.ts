/**
 * Diagnostic Script: Check Vessel Position Updates
 * Verifies if vessels are being updated in real-time by AIS backend
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkVesselUpdates() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  console.log('🔍 Checking vessel position updates...\n')

  // 1. Count total vessels
  const { count: totalVessels } = await supabase
    .from('vessels')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 Total vessels in database: ${totalVessels}`)

  // 2. Count vessels with positions
  const { count: vesselsWithPositions } = await supabase
    .from('vessels')
    .select('*', { count: 'exact', head: true })
    .not('current_latitude', 'is', null)
    .not('current_longitude', 'is', null)

  console.log(`📍 Vessels with positions: ${vesselsWithPositions}`)

  // 3. Get recent position updates (last 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: recentUpdates, count: recentCount } = await supabase
    .from('vessels')
    .select('vessel_name, mmsi, current_latitude, current_longitude, last_position_update', {
      count: 'exact',
    })
    .gte('last_position_update', oneHourAgo)
    .order('last_position_update', { ascending: false })
    .limit(10)

  console.log(`\n⏱️  Vessels updated in last hour: ${recentCount}`)

  if (recentUpdates && recentUpdates.length > 0) {
    console.log('\nRecent updates:')
    recentUpdates.forEach((v) => {
      const lastUpdate = new Date(v.last_position_update!)
      const minutesAgo = Math.floor((Date.now() - lastUpdate.getTime()) / 60000)
      console.log(
        `  • ${v.vessel_name} (${v.mmsi}) - ${minutesAgo} minutes ago at ${v.current_latitude?.toFixed(4)}, ${v.current_longitude?.toFixed(4)}`
      )
    })
  }

  // 4. Get oldest position updates
  const { data: oldestUpdates } = await supabase
    .from('vessels')
    .select('vessel_name, mmsi, current_latitude, current_longitude, last_position_update')
    .not('last_position_update', 'is', null)
    .order('last_position_update', { ascending: true })
    .limit(5)

  if (oldestUpdates && oldestUpdates.length > 0) {
    console.log('\n🕰️  Oldest position updates:')
    oldestUpdates.forEach((v) => {
      const lastUpdate = v.last_position_update
        ? new Date(v.last_position_update)
        : null
      const hoursAgo = lastUpdate
        ? Math.floor((Date.now() - lastUpdate.getTime()) / 3600000)
        : 'never'
      console.log(`  • ${v.vessel_name} (${v.mmsi}) - ${hoursAgo} hours ago`)
    })
  }

  // 5. Check vessel_positions table (historical data)
  const { count: totalPositions } = await supabase
    .from('vessel_positions')
    .select('*', { count: 'exact', head: true })

  console.log(`\n📜 Total position history records: ${totalPositions}`)

  const { count: recentPositions } = await supabase
    .from('vessel_positions')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', oneHourAgo)

  console.log(`📜 Position records in last hour: ${recentPositions}`)

  // 6. Check user_vessels (which vessels should be tracked)
  const { data: userVessels, count: trackedCount } = await supabase
    .from('user_vessels')
    .select('vessel_id, vessels(mmsi, vessel_name, last_position_update)', { count: 'exact' })

  console.log(`\n👤 Vessels assigned to users: ${trackedCount}`)

  if (userVessels && userVessels.length > 0) {
    console.log('\nUser vessels:')
    userVessels.slice(0, 10).forEach((uv: any) => {
      const vessel = uv.vessels
      const lastUpdate = vessel?.last_position_update
        ? new Date(vessel.last_position_update)
        : null
      const minutesAgo = lastUpdate
        ? Math.floor((Date.now() - lastUpdate.getTime()) / 60000)
        : 'never'
      console.log(`  • ${vessel?.vessel_name} (${vessel?.mmsi}) - updated ${minutesAgo} minutes ago`)
    })
  }

  // 7. Diagnosis
  console.log('\n' + '='.repeat(60))
  console.log('🔍 DIAGNOSIS:')
  console.log('='.repeat(60))

  if (recentCount === 0) {
    console.log('❌ NO vessels have been updated in the last hour')
    console.log('   This indicates the AIS backend is NOT running or NOT writing to the database')
    console.log('\n💡 Troubleshooting steps:')
    console.log('   1. Check if AIS backend is running: ps aux | grep ais-stream-backend')
    console.log('   2. Start AIS backend: pnpm ais:start')
    console.log('   3. Check backend logs for errors')
    console.log('   4. Verify .env.local has correct credentials:')
    console.log('      - AIS_STREAM_API_KEY')
    console.log('      - NEXT_PUBLIC_SUPABASE_URL')
    console.log('      - SUPABASE_SERVICE_ROLE_KEY')
  } else if (recentCount < (trackedCount || 0) * 0.5) {
    console.log('⚠️  Some vessels are updating, but not all')
    console.log(`   Only ${recentCount}/${trackedCount} tracked vessels updated recently`)
    console.log('\n💡 Possible issues:')
    console.log('   1. Some vessels may not be transmitting AIS')
    console.log('   2. Vessels may be outside subscription bounding boxes')
    console.log('   3. MMSI filters may be incorrect')
  } else {
    console.log('✅ Vessels ARE being updated in real-time')
    console.log(`   ${recentCount} vessels updated in the last hour`)
    console.log('\n💡 If map is not showing updates:')
    console.log('   1. Frontend may not be polling')
    console.log('   2. Check browser console for errors')
    console.log('   3. Verify useRealtimeVessels hook is enabled')
    console.log('   4. Hard refresh the page (Ctrl+Shift+R)')
  }

  console.log('='.repeat(60) + '\n')
}

checkVesselUpdates().catch(console.error)
