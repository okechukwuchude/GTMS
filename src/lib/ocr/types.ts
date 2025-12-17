/**
 * OCR Type Definitions
 * TypeScript interfaces for OCR processing and results
 */

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface OCRField {
  value: string | number | boolean | null
  confidence: number // 0-100
  boundingBox?: BoundingBox
  source: 'ocr' | 'manual'
}

export interface OCRResult {
  documentId: string
  fields: {
    // Container Details
    container_number?: OCRField
    bill_of_lading?: OCRField
    seal_number?: OCRField
    container_type?: OCRField

    // Shipper Information
    shipper_name?: OCRField
    shipper_address?: OCRField
    shipper_country?: OCRField

    // Consignee Information
    consignee_name?: OCRField
    consignee_address?: OCRField
    consignee_country?: OCRField

    // Cargo Details
    cargo_description?: OCRField
    commodity_type?: OCRField
    hs_code?: OCRField
    quantity?: OCRField
    quantity_unit?: OCRField
    weight_kg?: OCRField
    volume_cbm?: OCRField
    value_usd?: OCRField
    currency?: OCRField
    is_hazardous?: OCRField
    hazard_class?: OCRField

    // Ports & Schedule
    origin_port_id?: OCRField
    destination_port_id?: OCRField
    eta?: OCRField
    temperature_celsius?: OCRField
  }
  overallConfidence: number
  rawText: string
  processedAt: string
  processingTimeMs: number
}

/**
 * Vision API Response (simplified)
 * This is a simplified version of the actual Vision API response
 */
export interface VisionAPIResponse {
  fullText: string
  pages: any[] // Vision API page structure
  confidence: number // Average confidence (0-1)
  textAnnotations: any[] // Vision API text annotations
  raw: any // Raw Vision API response for debugging
}

export type DocumentStatus = 'uploading' | 'processing' | 'success' | 'error'

export type SupportedFileType = 'pdf' | 'jpg' | 'jpeg' | 'png' | 'tiff'

export interface DocumentUploadResult {
  documentId: string
  documentUrl: string
  fileType: SupportedFileType
  fileSize: number
  uploadedAt: string
}
