'use client'

import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
  Updater,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, LucideIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/shared/EmptyState'
import { DataTablePagination } from './DataTablePagination'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  // Pagination props
  currentPage?: number
  pageSize?: number
  totalItems?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  // Loading and empty states
  isLoading?: boolean
  emptyState?: {
    icon: LucideIcon
    title: string
    description: string
    action?: {
      label: string
      onClick: () => void
    }
  }
  // Row selection
  enableRowSelection?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (updater: Updater<RowSelectionState>) => void
  // Sorting
  sorting?: SortingState
  onSortingChange?: (updater: Updater<SortingState>) => void
  // Additional customization
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  emptyState,
  enableRowSelection = false,
  rowSelection = {},
  onRowSelectionChange,
  sorting = [],
  onSortingChange,
  className,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({})

  // Use controlled or uncontrolled sorting
  const sortingState = onSortingChange ? sorting : internalSorting
  const setSortingState = onSortingChange ? onSortingChange : setInternalSorting

  // Use controlled or uncontrolled row selection
  const rowSelectionState = onRowSelectionChange
    ? rowSelection
    : internalRowSelection
  const setRowSelectionState = onRowSelectionChange
    ? onRowSelectionChange
    : setInternalRowSelection

  // Add selection column if enabled
  const tableColumns = enableRowSelection
    ? [
        {
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        } as ColumnDef<TData, TValue>,
        ...columns,
      ]
    : columns

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSortingState,
    onRowSelectionChange: setRowSelectionState,
    state: {
      sorting: sortingState,
      rowSelection: rowSelectionState,
    },
    manualPagination: true, // Server-side pagination
    manualSorting: false, // Client-side sorting for current page
  })

  const totalPages = Math.ceil(totalItems / pageSize)

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {tableColumns.map((column, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pageSize }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {tableColumns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  // Render empty state
  if (!isLoading && data.length === 0 && emptyState) {
    return (
      <div className={cn('space-y-4', className)}>
        <EmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          description={emptyState.description}
          action={emptyState.action}
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b bg-gray-50">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const isSorted = header.column.getIsSorted()

                  return (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-gray-900"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            'flex items-center space-x-1',
                            canSort && 'cursor-pointer select-none'
                          )}
                          onClick={
                            canSort
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {canSort && (
                            <span className="ml-2">
                              {isSorted === 'asc' ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : isSorted === 'desc' ? (
                                <ArrowDown className="h-4 w-4" />
                              ) : (
                                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-blue-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {onPageChange && onPageSizeChange && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  )
}

// Helper function to create sortable column header
export function createSortableHeader(label: string) {
  return label
}
