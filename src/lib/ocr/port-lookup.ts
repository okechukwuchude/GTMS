/**
 * Port Lookup Utility
 * Map port codes extracted from OCR to port UUIDs in database
 */

import { createClient } from '@/lib/supabase/server'

interface PortLookupResult {
  portId: string
  portName: string
  code: string
  confidence: number
}

/**
 * Look up port by UN/LOCODE code
 * @param portCode - Port code (e.g., USNYC, SGSIN, NLRTM)
 * @returns Port information with confidence score
 */
export async function lookupPortByCode(
  portCode: string
): Promise<PortLookupResult | null> {
  // TODO: Sprint 3 - Implement port lookup
  // 1. Normalize port code (uppercase, remove spaces)
  // 2. Query ports table for matching code
  // 3. Try fuzzy matching if exact match not found
  // 4. Return port with confidence score

  try {
    const normalizedCode = portCode.toUpperCase().trim()

    const supabase = await createClient()

    // Try exact match first
    const { data: exactMatch, error: exactError } = await supabase
      .from('ports')
      .select('id, name, code, country_code')
      .eq('code', normalizedCode)
      .eq('status', 'active')
      .single()

    if (exactMatch && !exactError) {
      return {
        portId: exactMatch.id,
        portName: exactMatch.name,
        code: exactMatch.code,
        confidence: 100, // Exact match
      }
    }

    // Try fuzzy match (similar codes)
    // TODO: Implement fuzzy matching logic
    // - Remove country prefix and try again
    // - Try with different separators
    // - Levenshtein distance for typos

    return null
  } catch (error) {
    console.error('Port lookup error:', error)
    return null
  }
}

/**
 * Look up multiple ports from text
 * @param text - OCR extracted text
 * @returns Origin and destination port information
 */
export async function lookupPortsFromText(
  text: string
): Promise<{
  origin: PortLookupResult | null
  destination: PortLookupResult | null
}> {
  // TODO: Sprint 3 - Extract port codes from text and lookup
  // 1. Find "Port of Loading" or "Origin" section
  // 2. Find "Port of Discharge" or "Destination" section
  // 3. Extract port codes from those sections
  // 4. Lookup each code

  return {
    origin: null,
    destination: null,
  }
}

/**
 * Get all active ports (for fallback dropdown)
 */
export async function getAllActivePorts() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ports')
      .select('id, name, code, country_code, city')
      .eq('status', 'active')
      .order('name', { ascending: true })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching ports:', error)
    return []
  }
}
