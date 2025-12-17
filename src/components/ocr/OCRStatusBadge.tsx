/**
 * OCR Status Badge Component
 * Display OCR processing status and confidence level
 */

import { CheckCircle2, AlertCircle, Loader2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type OCRStatus = 'idle' | 'processing' | 'success' | 'error'

export interface OCRStatusBadgeProps {
  status: OCRStatus
  confidence?: number // 0-100
  error?: string
  className?: string
}

/**
 * Get confidence tier from score
 */
function getConfidenceTier(
  confidence: number
): 'high' | 'medium' | 'low' | 'very-low' {
  if (confidence >= 85) return 'high'
  if (confidence >= 75) return 'medium'
  if (confidence >= 60) return 'low'
  return 'very-low'
}

/**
 * OCR Status Badge Component
 */
export function OCRStatusBadge({
  status,
  confidence,
  error,
  className,
}: OCRStatusBadgeProps) {
  // Idle state (no OCR attempted)
  if (status === 'idle') {
    return null
  }

  // Processing state
  if (status === 'processing') {
    return (
      <Badge
        variant="secondary"
        className={cn('flex items-center gap-1.5', className)}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Extracting data...</span>
      </Badge>
    )
  }

  // Error state
  if (status === 'error') {
    return (
      <Badge
        variant="destructive"
        className={cn('flex items-center gap-1.5', className)}
      >
        <XCircle className="h-3 w-3" />
        <span>{error || 'Extraction failed'}</span>
      </Badge>
    )
  }

  // Success state (with confidence)
  if (status === 'success' && confidence !== undefined) {
    const tier = getConfidenceTier(confidence)

    const badgeConfig = {
      high: {
        variant: 'default' as const,
        icon: CheckCircle2,
        text: `High confidence (${confidence}%)`,
        className: 'bg-green-600 hover:bg-green-700',
      },
      medium: {
        variant: 'secondary' as const,
        icon: AlertCircle,
        text: `Review recommended (${confidence}%)`,
        className: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      },
      low: {
        variant: 'secondary' as const,
        icon: AlertCircle,
        text: `Manual review required (${confidence}%)`,
        className: 'bg-orange-600 hover:bg-orange-700 text-white',
      },
      'very-low': {
        variant: 'destructive' as const,
        icon: AlertCircle,
        text: `Low confidence (${confidence}%)`,
        className: '',
      },
    }

    const config = badgeConfig[tier]
    const Icon = config.icon

    return (
      <Badge
        variant={config.variant}
        className={cn('flex items-center gap-1.5', config.className, className)}
      >
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </Badge>
    )
  }

  // Success without confidence
  if (status === 'success') {
    return (
      <Badge
        variant="default"
        className={cn('flex items-center gap-1.5 bg-green-600', className)}
      >
        <CheckCircle2 className="h-3 w-3" />
        <span>Extraction complete</span>
      </Badge>
    )
  }

  return null
}
