/**
 * Field Extraction Functions
 * Extract specific fields from OCR text using patterns and keywords
 */

import { OCRField } from './types'

/**
 * Helper function to create OCRField with default confidence
 */
function createOCRField(
  value: string | number | boolean | null,
  confidence: number = 50,
  source: 'ocr' | 'manual' = 'ocr'
): OCRField {
  return {
    value,
    confidence,
    source,
  }
}

/**
 * Helper function to find text after a keyword
 */
function extractAfterKeyword(
  text: string,
  keywords: string[],
  maxChars: number = 100
): string | null {
  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lowerLine = line.toLowerCase()

    for (const keyword of keywords) {
      if (lowerLine.includes(keyword.toLowerCase())) {
        // Found keyword, extract text after it on same line
        const keywordIndex = lowerLine.indexOf(keyword.toLowerCase())
        let extracted = line.substring(keywordIndex + keyword.length).trim()

        // If nothing on same line, try next line
        if (!extracted && i < lines.length - 1) {
          extracted = lines[i + 1].trim()
        }

        if (extracted) {
          return extracted.substring(0, maxChars)
        }
      }
    }
  }

  return null
}

/**
 * Extract container number from text
 * ISO 6346 format: 4 letters + 7 digits (e.g., MSCU1234567)
 */
export function extractContainerNumber(text: string): OCRField | null {
  // Pattern: 4 uppercase letters + 7 digits
  const pattern = /\b([A-Z]{4})\s*(\d{7})\b/g
  const matches = Array.from(text.matchAll(pattern))

  if (matches.length > 0) {
    const containerNumber = matches[0][1] + matches[0][2]
    return createOCRField(containerNumber, 90) // High confidence for structured format
  }

  return null
}

/**
 * Extract Bill of Lading number from text
 */
export function extractBillOfLading(text: string): OCRField | null {
  const keywords = [
    'B/L No',
    'B/L:',
    'BOL',
    'Bill of Lading',
    'BL No',
    'B.L.',
  ]

  const extracted = extractAfterKeyword(text, keywords, 50)

  if (extracted) {
    // Clean up: remove colons, "No.", etc.
    const cleaned = extracted.replace(/^[:\s\-No.]+/, '').trim()
    return createOCRField(cleaned, 85)
  }

  return null
}

/**
 * Extract shipper name from text
 */
export function extractShipperName(text: string): OCRField | null {
  const keywords = ['Shipper', 'Shipper Name', 'Consignor']

  const extracted = extractAfterKeyword(text, keywords, 150)

  if (extracted) {
    // Take only the first line (name usually on one line)
    const name = extracted.split('\n')[0].trim()
    return createOCRField(name, 80)
  }

  return null
}

/**
 * Extract consignee name from text
 */
export function extractConsigneeName(text: string): OCRField | null {
  const keywords = ['Consignee', 'Consignee Name', 'Receiver']

  const extracted = extractAfterKeyword(text, keywords, 150)

  if (extracted) {
    // Take only the first line (name usually on one line)
    const name = extracted.split('\n')[0].trim()
    return createOCRField(name, 80)
  }

  return null
}

/**
 * Extract shipper address from text
 */
export function extractShipperAddress(text: string): OCRField | null {
  const keywords = ['Shipper Address', 'Shipper:', 'Shipper']

  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lowerLine = line.toLowerCase()

    for (const keyword of keywords) {
      if (lowerLine.includes(keyword.toLowerCase())) {
        // Found keyword, extract next 2-3 lines as address
        const addressLines = []
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const addressLine = lines[j].trim()
          if (addressLine && !addressLine.toLowerCase().includes('consignee')) {
            addressLines.push(addressLine)
          } else {
            break // Stop at next section
          }
        }

        if (addressLines.length > 0) {
          return createOCRField(addressLines.join(', '), 70)
        }
      }
    }
  }

  return null
}

/**
 * Extract consignee address from text
 */
export function extractConsigneeAddress(text: string): OCRField | null {
  const keywords = ['Consignee Address', 'Consignee:', 'Consignee']

  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lowerLine = line.toLowerCase()

    for (const keyword of keywords) {
      if (lowerLine.includes(keyword.toLowerCase())) {
        // Found keyword, extract next 2-3 lines as address
        const addressLines = []
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const addressLine = lines[j].trim()
          if (addressLine && !addressLine.toLowerCase().includes('cargo')) {
            addressLines.push(addressLine)
          } else {
            break // Stop at next section
          }
        }

        if (addressLines.length > 0) {
          return createOCRField(addressLines.join(', '), 70)
        }
      }
    }
  }

  return null
}

/**
 * Extract cargo description from text
 */
export function extractCargoDescription(text: string): OCRField | null {
  const keywords = [
    'Description of Goods',
    'Cargo Description',
    'Description:',
    'Goods:',
    'Commodity:',
  ]

  const extracted = extractAfterKeyword(text, keywords, 300)

  if (extracted) {
    return createOCRField(extracted, 75)
  }

  return null
}

/**
 * Extract HS Code from text
 * Format: 4 digits . 2 digits . 2 digits (e.g., 8517.12.00)
 */
export function extractHSCode(text: string): OCRField | null {
  // Pattern: XXXX.XX.XX or XXXXXXXX
  const pattern = /\b(\d{4})[.\s]?(\d{2})[.\s]?(\d{2})\b/
  const match = text.match(pattern)

  if (match) {
    const hsCode = `${match[1]}.${match[2]}.${match[3]}`
    return createOCRField(hsCode, 70)
  }

  // Try simpler 6-digit format
  const simplePattern = /\bHS[:\s]*(\d{6,8})\b/i
  const simpleMatch = text.match(simplePattern)

  if (simpleMatch) {
    return createOCRField(simpleMatch[1], 65)
  }

  return null
}

/**
 * Extract quantity from text
 */
export function extractQuantity(text: string): OCRField | null {
  const keywords = ['Quantity', 'Qty', 'Packages', 'Pcs', 'Units']

  const extracted = extractAfterKeyword(text, keywords, 30)

  if (extracted) {
    // Extract number
    const numberMatch = extracted.match(/(\d+[,\d]*\.?\d*)/)
    if (numberMatch) {
      const quantity = parseFloat(numberMatch[1].replace(/,/g, ''))
      return createOCRField(quantity, 80)
    }
  }

  return null
}

/**
 * Extract weight from text (in kg)
 */
export function extractWeight(text: string): OCRField | null {
  const keywords = ['Weight', 'Gross Weight', 'Net Weight', 'KG', 'KGS']

  const extracted = extractAfterKeyword(text, keywords, 50)

  if (extracted) {
    // Extract number
    const numberMatch = extracted.match(/(\d+[,\d]*\.?\d*)/)
    if (numberMatch) {
      const weight = parseFloat(numberMatch[1].replace(/,/g, ''))
      return createOCRField(weight, 80)
    }
  }

  // Try pattern: "1000 KG" or "1000KG"
  const pattern = /(\d+[,\d]*\.?\d*)\s*(KG|KGS|kg|kgs)\b/i
  const match = text.match(pattern)

  if (match) {
    const weight = parseFloat(match[1].replace(/,/g, ''))
    return createOCRField(weight, 75)
  }

  return null
}

/**
 * Extract value from text (in USD)
 */
export function extractValue(text: string): OCRField | null {
  const keywords = ['Value', 'Total Value', 'Amount', 'USD', 'US$']

  const extracted = extractAfterKeyword(text, keywords, 50)

  if (extracted) {
    // Extract number (handle currency symbols)
    const numberMatch = extracted.match(/(\d+[,\d]*\.?\d*)/)
    if (numberMatch) {
      const value = parseFloat(numberMatch[1].replace(/,/g, ''))
      return createOCRField(value, 70)
    }
  }

  // Try pattern: "$1000" or "USD 1000"
  const pattern = /(?:USD|US\$|\$)\s*(\d+[,\d]*\.?\d*)/i
  const match = text.match(pattern)

  if (match) {
    const value = parseFloat(match[1].replace(/,/g, ''))
    return createOCRField(value, 75)
  }

  return null
}

/**
 * Extract port codes from text
 */
export function extractPorts(
  text: string
): { origin?: OCRField; destination?: OCRField } {
  const result: { origin?: OCRField; destination?: OCRField } = {}

  // Origin port keywords
  const originKeywords = [
    'Port of Loading',
    'POL',
    'Origin Port',
    'Loading Port',
    'From:',
  ]

  // Destination port keywords
  const destKeywords = [
    'Port of Discharge',
    'POD',
    'Destination Port',
    'Discharge Port',
    'To:',
  ]

  // Extract origin port
  const originExtracted = extractAfterKeyword(text, originKeywords, 50)
  if (originExtracted) {
    // Look for port code pattern (e.g., USNYC, SGSIN)
    const portCodeMatch = originExtracted.match(/\b([A-Z]{2}[A-Z]{3})\b/)
    if (portCodeMatch) {
      result.origin = createOCRField(portCodeMatch[1], 75)
    } else {
      // Just use the extracted text (port name)
      result.origin = createOCRField(originExtracted.split(',')[0].trim(), 60)
    }
  }

  // Extract destination port
  const destExtracted = extractAfterKeyword(text, destKeywords, 50)
  if (destExtracted) {
    // Look for port code pattern
    const portCodeMatch = destExtracted.match(/\b([A-Z]{2}[A-Z]{3})\b/)
    if (portCodeMatch) {
      result.destination = createOCRField(portCodeMatch[1], 75)
    } else {
      // Just use the extracted text (port name)
      result.destination = createOCRField(destExtracted.split(',')[0].trim(), 60)
    }
  }

  return result
}

/**
 * Extract dates from text (ETA, ETD)
 */
export function extractDates(text: string): { eta?: OCRField; etd?: OCRField } {
  const result: { eta?: OCRField; etd?: OCRField } = {}

  // ETA keywords
  const etaKeywords = ['ETA', 'Estimated Arrival', 'Arrival Date']

  // Extract ETA
  const etaExtracted = extractAfterKeyword(text, etaKeywords, 30)
  if (etaExtracted) {
    // Try to parse date (various formats)
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/, // MM/DD/YYYY or DD/MM/YYYY
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/, // YYYY-MM-DD
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})/i, // DD MMM YYYY
    ]

    for (const pattern of datePatterns) {
      const match = etaExtracted.match(pattern)
      if (match) {
        result.eta = createOCRField(match[0], 70)
        break
      }
    }
  }

  return result
}

/**
 * Extract hazardous indicator from text
 */
export function extractHazardousIndicator(text: string): OCRField | null {
  const hazardKeywords = [
    'HAZMAT',
    'DANGEROUS',
    'HAZARDOUS',
    'DG',
    'Dangerous Goods',
    'IMO Class',
  ]

  const lowerText = text.toLowerCase()

  for (const keyword of hazardKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return createOCRField(true, 85)
    }
  }

  // Check for "Non-Hazardous" or "Not Dangerous"
  if (lowerText.includes('non-hazardous') || lowerText.includes('not dangerous')) {
    return createOCRField(false, 80)
  }

  return null
}

/**
 * Extract temperature requirements from text
 */
export function extractTemperature(text: string): OCRField | null {
  const keywords = ['Temperature', 'Temp', '°C', 'Celsius']

  const extracted = extractAfterKeyword(text, keywords, 30)

  if (extracted) {
    // Extract number
    const numberMatch = extracted.match(/(-?\d+\.?\d*)\s*°?[Cc]?/)
    if (numberMatch) {
      const temp = parseFloat(numberMatch[1])
      return createOCRField(temp, 75)
    }
  }

  // Try pattern: "-18°C" or "18 C"
  const pattern = /(-?\d+\.?\d*)\s*°?\s*[Cc]\b/
  const match = text.match(pattern)

  if (match) {
    const temp = parseFloat(match[1])
    return createOCRField(temp, 70)
  }

  return null
}

/**
 * Extract seal number from text
 */
export function extractSealNumber(text: string): OCRField | null {
  const keywords = ['Seal No', 'Seal Number', 'Seal:', 'Container Seal']

  const extracted = extractAfterKeyword(text, keywords, 30)

  if (extracted) {
    const cleaned = extracted.replace(/^[:\s\-No.]+/, '').trim()
    return createOCRField(cleaned, 75)
  }

  return null
}

/**
 * Extract container type from text
 */
export function extractContainerType(text: string): OCRField | null {
  const containerTypes = [
    '20FT',
    '40FT',
    '40HC',
    '45HC',
    '20GP',
    '40GP',
    'REEFER',
    'TANK',
    'FLAT RACK',
  ]

  const upperText = text.toUpperCase()

  for (const type of containerTypes) {
    if (upperText.includes(type)) {
      return createOCRField(type, 80)
    }
  }

  return null
}

/**
 * Extract volume from text (in CBM)
 */
export function extractVolume(text: string): OCRField | null {
  const keywords = ['Volume', 'CBM', 'Cubic Meters', 'M3']

  const extracted = extractAfterKeyword(text, keywords, 30)

  if (extracted) {
    const numberMatch = extracted.match(/(\d+\.?\d*)/)
    if (numberMatch) {
      const volume = parseFloat(numberMatch[1])
      return createOCRField(volume, 75)
    }
  }

  return null
}

/**
 * Main function to extract all fields from OCR text
 */
export function extractAllFields(text: string, visionConfidence: number = 0) {
  const ports = extractPorts(text)
  const dates = extractDates(text)

  return {
    // Container Details (4 fields)
    container_number: extractContainerNumber(text),
    bill_of_lading: extractBillOfLading(text),
    seal_number: extractSealNumber(text),
    container_type: extractContainerType(text),

    // Shipper Information (3 fields)
    shipper_name: extractShipperName(text),
    shipper_address: extractShipperAddress(text),
    shipper_country: null, // TODO: Extract from address or separate field

    // Consignee Information (3 fields)
    consignee_name: extractConsigneeName(text),
    consignee_address: extractConsigneeAddress(text),
    consignee_country: null, // TODO: Extract from address or separate field

    // Cargo Details (12 fields)
    cargo_description: extractCargoDescription(text),
    commodity_type: null, // TODO: Classify based on description
    hs_code: extractHSCode(text),
    quantity: extractQuantity(text),
    quantity_unit: null, // TODO: Extract unit (pcs, kg, etc.)
    weight_kg: extractWeight(text),
    volume_cbm: extractVolume(text),
    value_usd: extractValue(text),
    currency: null, // TODO: Extract currency code
    is_hazardous: extractHazardousIndicator(text),
    hazard_class: null, // TODO: Extract IMO class if hazardous

    // Ports & Schedule (4 fields)
    origin_port: ports.origin,
    destination_port: ports.destination,
    eta: dates.eta,
    temperature_celsius: extractTemperature(text),
  }
}
