'use client'

import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface DataTableToolbarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  children?: React.ReactNode
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
}: DataTableToolbarProps) {
  const isFiltered = searchValue && searchValue.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {onSearchChange && (
          <div className="relative w-full max-w-sm">
            <Input
              placeholder={searchPlaceholder}
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9"
            />
            {isFiltered && (
              <Button
                variant="ghost"
                onClick={() => onSearchChange('')}
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-transparent"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        )}
      </div>
      {children && <div className="flex items-center space-x-2">{children}</div>}
    </div>
  )
}
