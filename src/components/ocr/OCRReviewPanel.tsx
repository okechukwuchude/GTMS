/**
 * OCR Review Panel Component
 * Display extracted fields with confidence scores for user review
 */

'use client'

import { OCRResult, OCRField } from '@/lib/ocr/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertTriangle, FileText } from 'lucide-react'
import { FieldConfidenceIcon } from './FieldConfidenceIndicator'
import { cn } from '@/lib/utils'

export interface OCRReviewPanelProps {
  ocrResult: OCRResult
  onAcceptAll?: () => void
  onReviewField?: (fieldName: string) => void
  className?: string
}

/**
 * Format field name for display
 */
function formatFieldName(fieldName: string): string {
  return fieldName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Get field display value
 */
function getFieldDisplayValue(field: OCRField | null | undefined): string {
  if (!field || field.value === null || field.value === undefined) {
    return '—'
  }

  if (typeof field.value === 'boolean') {
    return field.value ? 'Yes' : 'No'
  }

  return String(field.value)
}

/**
 * OCR Review Panel Component
 */
export function OCRReviewPanel({
  ocrResult,
  onAcceptAll,
  onReviewField,
  className,
}: OCRReviewPanelProps) {
  const { fields, overallConfidence, rawText } = ocrResult

  // Group fields by section
  const fieldSections = {
    'Container Details': [
      'container_number',
      'bill_of_lading',
      'seal_number',
      'container_type',
    ],
    'Shipper Information': [
      'shipper_name',
      'shipper_address',
      'shipper_country',
    ],
    'Consignee Information': [
      'consignee_name',
      'consignee_address',
      'consignee_country',
    ],
    'Cargo Details': [
      'cargo_description',
      'commodity_type',
      'hs_code',
      'quantity',
      'quantity_unit',
      'weight_kg',
      'volume_cbm',
      'value_usd',
      'currency',
      'is_hazardous',
      'hazard_class',
    ],
    'Ports & Schedule': [
      'origin_port_id',
      'destination_port_id',
      'eta',
      'temperature_celsius',
    ],
  }

  // Count extracted fields
  const extractedCount = Object.values(fields).filter(
    (field) => field && field.value !== null && field.value !== undefined
  ).length

  const totalFields = 26

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              OCR Extraction Results
            </CardTitle>
            <CardDescription className="mt-1">
              Review extracted fields before submitting
            </CardDescription>
          </div>

          {/* Overall Confidence */}
          <Badge
            variant={overallConfidence >= 85 ? 'default' : overallConfidence >= 75 ? 'secondary' : 'destructive'}
            className={cn(
              'ml-4',
              overallConfidence >= 85 && 'bg-green-600',
              overallConfidence >= 75 && overallConfidence < 85 && 'bg-yellow-600 text-white'
            )}
          >
            {overallConfidence >= 85 ? (
              <CheckCircle2 className="mr-1 h-3 w-3" />
            ) : (
              <AlertTriangle className="mr-1 h-3 w-3" />
            )}
            {overallConfidence}% Overall
          </Badge>
        </div>

        {/* Extraction Summary */}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            <strong>{extractedCount}</strong> of {totalFields} fields extracted
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span>
            Processing time: {(ocrResult.processingTimeMs / 1000).toFixed(1)}s
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* Field Sections */}
            {Object.entries(fieldSections).map(([sectionName, fieldNames]) => {
              const sectionFields = fieldNames
                .map((name) => ({
                  name,
                  field: fields[name as keyof typeof fields],
                }))
                .filter((item) => item.field && item.field.value !== null && item.field.value !== undefined)

              if (sectionFields.length === 0) {
                return null
              }

              return (
                <div key={sectionName} className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">
                    {sectionName}
                  </h4>
                  <div className="space-y-2">
                    {sectionFields.map(({ name, field }) => (
                      <div
                        key={name}
                        className={cn(
                          'flex items-start justify-between rounded-md border p-3 transition-colors',
                          field && field.confidence < 75 && 'border-orange-300 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20'
                        )}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {formatFieldName(name)}
                            </span>
                            {field && (
                              <FieldConfidenceIcon confidence={field.confidence} />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getFieldDisplayValue(field)}
                          </p>
                        </div>

                        {/* Review Button */}
                        {field && field.confidence < 85 && onReviewField && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onReviewField(name)}
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Actions */}
        {onAcceptAll && (
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Scroll to top to show all fields
                const lowConfidenceFields = Object.entries(fields)
                  .filter(([_, field]) => field && field.confidence < 75)
                  .map(([name]) => name)

                if (lowConfidenceFields.length > 0 && onReviewField) {
                  onReviewField(lowConfidenceFields[0])
                }
              }}
            >
              Review Low Confidence
            </Button>
            <Button
              type="button"
              onClick={onAcceptAll}
            >
              Accept & Continue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
