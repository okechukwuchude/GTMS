import { cn } from '@/lib/utils'

type ContainerStatus =
  | 'registered'
  | 'in_transit'
  | 'arrived'
  | 'pending_inspection'
  | 'under_inspection'
  | 'inspection_complete'
  | 'cleared'
  | 'detained'
  | 'released'
  | 'departed'

interface StatusBadgeProps {
  status: ContainerStatus
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<
  ContainerStatus,
  { label: string; color: string }
> = {
  registered: { label: 'Registered', color: 'bg-status-info text-white' },
  in_transit: { label: 'In Transit', color: 'bg-status-info text-white' },
  arrived: { label: 'Arrived', color: 'bg-status-info text-white' },
  pending_inspection: {
    label: 'Pending Inspection',
    color: 'bg-status-warning text-white',
  },
  under_inspection: {
    label: 'Under Inspection',
    color: 'bg-status-warning text-white',
  },
  inspection_complete: {
    label: 'Inspection Complete',
    color: 'bg-status-success text-white',
  },
  cleared: { label: 'Cleared', color: 'bg-status-success text-white' },
  detained: { label: 'Detained', color: 'bg-status-danger text-white' },
  released: { label: 'Released', color: 'bg-status-success text-white' },
  departed: { label: 'Departed', color: 'bg-status-inactive text-white' },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

export default function StatusBadge({
  status,
  size = 'md',
}: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium uppercase',
        config.color,
        sizeClasses[size]
      )}
    >
      {config.label}
    </span>
  )
}
