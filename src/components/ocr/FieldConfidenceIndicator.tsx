/**
 * Field Confidence Indicator Component
 * Display confidence badge next to form field labels
 */

import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface FieldConfidenceIndicatorProps {
  confidence: number // 0-100
  fieldName: string
  isOCRExtracted?: boolean
  className?: string
}

/**
 * Get confidence tier from score
 */
function getConfidenceTier(
  confidence: number
): 'high' | 'medium' | 'low' | 'very-low' {
  if (confidence >= 95) return 'high'
  if (confidence >= 85) return 'high'
  if (confidence >= 75) return 'medium'
  if (confidence >= 60) return 'low'
  return 'very-low'
}

/**
 * Field Confidence Indicator Component
 */
export function FieldConfidenceIndicator({
  confidence,
  fieldName,
  isOCRExtracted = true,
  className,
}: FieldConfidenceIndicatorProps) {
  if (!isOCRExtracted) {
    return null
  }

  const tier = getConfidenceTier(confidence)

  const config = {
    high: {
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-950',
      label: 'High confidence',
      description: 'This value was extracted with high confidence',
    },
    medium: {
      icon: Info,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-950',
      label: 'Review',
      description: 'Please review this extracted value',
    },
    low: {
      icon: AlertTriangle,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
      label: 'Low confidence',
      description: 'This value may need correction',
    },
    'very-low': {
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-950',
      label: 'Verify',
      description: 'Please verify this extracted value',
    },
  }

  const { icon: Icon, color, bgColor, label, description } = config[tier]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'ml-2 h-5 px-1.5 text-xs',
              bgColor,
              color,
              className
            )}
          >
            <Icon className="mr-1 h-3 w-3" />
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{fieldName}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
            <p className="text-xs font-mono">
              Confidence: {confidence}%
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Compact version for inline use
 */
export function FieldConfidenceIcon({
  confidence,
  className,
}: {
  confidence: number
  className?: string
}) {
  const tier = getConfidenceTier(confidence)

  const config = {
    high: {
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    medium: {
      icon: Info,
      color: 'text-yellow-600',
    },
    low: {
      icon: AlertTriangle,
      color: 'text-orange-600',
    },
    'very-low': {
      icon: AlertTriangle,
      color: 'text-red-600',
    },
  }

  const { icon: Icon, color } = config[tier]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('inline-flex', className)}>
            <Icon className={cn('h-4 w-4', color)} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">OCR confidence: {confidence}%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
