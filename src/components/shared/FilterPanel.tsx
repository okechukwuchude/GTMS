'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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

interface Port {
  id: string
  name: string
  code: string
  country_code: string
}

export interface FilterValues {
  search?: string
  statuses: ContainerStatus[]
  originPortId?: string
  destinationPortId?: string
  dateFrom?: string
  dateTo?: string
}

interface FilterPanelProps {
  filters: FilterValues
  onFiltersChange: (filters: FilterValues) => void
  ports?: Port[]
  isLoading?: boolean
  className?: string
}

const statusOptions: { value: ContainerStatus; label: string }[] = [
  { value: 'registered', label: 'Registered' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'arrived', label: 'Arrived' },
  { value: 'pending_inspection', label: 'Pending Inspection' },
  { value: 'under_inspection', label: 'Under Inspection' },
  { value: 'inspection_complete', label: 'Inspection Complete' },
  { value: 'cleared', label: 'Cleared' },
  { value: 'detained', label: 'Detained' },
  { value: 'released', label: 'Released' },
  { value: 'departed', label: 'Departed' },
]

export default function FilterPanel({
  filters,
  onFiltersChange,
  ports = [],
  isLoading = false,
  className,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(true)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusToggle = (status: ContainerStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status]
    onFiltersChange({ ...filters, statuses: newStatuses })
  }

  const handleOriginPortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      originPortId: value === 'all' ? undefined : value,
    })
  }

  const handleDestinationPortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      destinationPortId: value === 'all' ? undefined : value,
    })
  }

  const handleDateFromChange = (value: string) => {
    onFiltersChange({ ...filters, dateFrom: value })
  }

  const handleDateToChange = (value: string) => {
    onFiltersChange({ ...filters, dateTo: value })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      statuses: [],
      originPortId: undefined,
      destinationPortId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.statuses.length > 0 ||
    filters.originPortId ||
    filters.destinationPortId ||
    filters.dateFrom ||
    filters.dateTo

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn('rounded-lg border bg-white', className)}
    >
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
              {[
                filters.statuses.length,
                filters.originPortId ? 1 : 0,
                filters.destinationPortId ? 1 : 0,
                filters.dateFrom || filters.dateTo ? 1 : 0,
              ]
                .filter((n) => n > 0)
                .reduce((a, b) => a + b, 0)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Clear All
            </Button>
          )}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent>
        <div className="space-y-4 p-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Container number, bill of lading..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Status Multi-Select */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={filters.statuses.includes(option.value)}
                    onCheckedChange={() => handleStatusToggle(option.value)}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor={`status-${option.value}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Port Selects */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Origin Port */}
            <div className="space-y-2">
              <Label htmlFor="origin-port" className="text-sm font-medium">
                Origin Port
              </Label>
              <Select
                value={filters.originPortId || 'all'}
                onValueChange={handleOriginPortChange}
                disabled={isLoading}
              >
                <SelectTrigger id="origin-port">
                  <SelectValue placeholder="All ports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ports</SelectItem>
                  {ports.map((port) => (
                    <SelectItem key={port.id} value={port.id}>
                      {port.name} ({port.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destination Port */}
            <div className="space-y-2">
              <Label htmlFor="destination-port" className="text-sm font-medium">
                Destination Port
              </Label>
              <Select
                value={filters.destinationPortId || 'all'}
                onValueChange={handleDestinationPortChange}
                disabled={isLoading}
              >
                <SelectTrigger id="destination-port">
                  <SelectValue placeholder="All ports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ports</SelectItem>
                  {ports.map((port) => (
                    <SelectItem key={port.id} value={port.id}>
                      {port.name} ({port.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date-from" className="text-sm font-medium">
                Date From
              </Label>
              <Input
                id="date-from"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleDateFromChange(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to" className="text-sm font-medium">
                Date To
              </Label>
              <Input
                id="date-to"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleDateToChange(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
