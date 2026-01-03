/**
 * AIS Backend Monitoring Tool
 * Monitor database writes in real-time to diagnose AIS backend issues
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function monitorAISBackend() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  console.log('🔍 AIS Backend Monitor - Watching for database updates...')
  console.log('Press Ctrl+C to stop\n')

  // Get initial state
  const { data: initialVessels } = await supabase
    .from('vessels')
    .select('id, mmsi, vessel_name, current_latitude, current_longitude, last_position_update')
    .not('current_latitude', 'is', null)
    .order('last_position_update', { ascending: false })
    .limit(5)

  console.log('📍 Current vessel positions (top 5):')
  initialVessels?.forEach((v) => {
    const lastUpdate = v.last_position_update ? new Date(v.last_position_update) : null
    const ago = lastUpdate
      ? `${Math.floor((Date.now() - lastUpdate.getTime()) / 60000)} min ago`
      : 'never'
    console.log(
      `  ${v.vessel_name} (${v.mmsi}) - ${v.current_latitude?.toFixed(4)}, ${v.current_longitude?.toFixed(4)} - ${ago}`
    )
  })

  console.log('\n⏳ Waiting for updates (checking every 5 seconds)...\n')

  let lastCheckTime = new Date().toISOString()

  setInterval(async () => {
    try {
      // Check for vessels updated since last check
      const { data: updatedVessels, error } = await supabase
        .from('vessels')
        .select('mmsi, vessel_name, current_latitude, current_longitude, last_position_update')
        .gte('last_position_update', lastCheckTime)
        .order('last_position_update', { ascending: false })

      if (error) {
        console.error('❌ Error querying vessels:', error)
        return
      }

      if (updatedVessels && updatedVessels.length > 0) {
        console.log(
          `✅ [${new Date().toLocaleTimeString()}] ${updatedVessels.length} vessel(s) updated:`
        )
        updatedVessels.forEach((v) => {
          console.log(
            `   • ${v.vessel_name} (${v.mmsi}) - ${v.current_latitude?.toFixed(4)}, ${v.current_longitude?.toFixed(4)}`
          )
        })
        console.log('')
      } else {
        // Show a dot to indicate we're still monitoring
        process.stdout.write('.')
      }

      // Check vessel_positions table for new entries
      const { data: newPositions } = await supabase
        .from('vessel_positions')
        .select('vessel_id, latitude, longitude, timestamp')
        .gte('timestamp', lastCheckTime)
        .order('timestamp', { ascending: false })

      if (newPositions && newPositions.length > 0) {
        console.log(`\n📜 [${new Date().toLocaleTimeString()}] ${newPositions.length} position history records written`)
      }

      lastCheckTime = new Date().toISOString()
    } catch (error) {
      console.error('❌ Monitoring error:', error)
    }
  }, 5000)
}

monitorAISBackend().catch(console.error)
