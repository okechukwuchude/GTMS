'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  Package,
  Ship,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import StatsCard from '@/components/shared/StatsCard'
import StatusBadge from '@/components/shared/StatusBadge'
import FilterPanel, { FilterValues } from '@/components/shared/FilterPanel'
import { DataTable } from '@/components/shared/data-table'
import ContainerDialog from '@/components/containers/ContainerDialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useContainerList, useDeleteContainer } from '@/lib/hooks/useContainers'
import { usePorts } from '@/lib/hooks/usePorts'
import { ContainerWithRelations } from '@/types/container.types'
import { toast } from 'sonner'

export default function ContainersPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    statuses: [],
    originPortId: undefined,
    destinationPortId: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedContainer, setSelectedContainer] =
    useState<ContainerWithRelations>()

  const { data: ports } = usePorts()
  const { data: containersData, isLoading } = useContainerList({
    page,
    limit: pageSize,
    search: filters.search,
    statuses: filters.statuses,
    originPortId: filters.originPortId,
    destinationPortId: filters.destinationPortId,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  })

  const deleteContainer = useDeleteContainer()

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handleRegisterClick = () => {
    setDialogMode('create')
    setSelectedContainer(undefined)
    setDialogOpen(true)
  }

  const handleEditClick = (container: ContainerWithRelations) => {
    setDialogMode('edit')
    setSelectedContainer(container)
    setDialogOpen(true)
  }

  const handleDeleteClick = async (container: ContainerWithRelations) => {
    if (
      !confirm(
        `Are you sure you want to delete container ${container.container_number}?`
      )
    ) {
      return
    }

    try {
      await deleteContainer.mutateAsync(container.id)
    } catch (error) {
      console.error('Failed to delete container:', error)
    }
  }

  // Calculate stats from current data
  const stats = {
    total: containersData?.total || 0,
    inTransit:
      containersData?.data.filter((c) =>
        ['in_transit', 'arrived'].includes(c.status)
      ).length || 0,
    cleared:
      containersData?.data.filter((c) =>
        ['cleared', 'released'].includes(c.status)
      ).length || 0,
    highRisk:
      containersData?.data.filter((c) =>
        ['detained', 'pending_inspection'].includes(c.status)
      ).length || 0,
  }

  // Define table columns
  const columns: ColumnDef<ContainerWithRelations>[] = [
    {
      accessorKey: 'container_number',
      header: 'Container Number',
      cell: ({ row }) => (
        <Link
          href={`/dashboard/containers/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.container_number}
        </Link>
      ),
    },
    {
      id: 'track',
      header: 'Track',
      cell: ({ row }) => {
        const vesselId = row.original.vessel_id
        return vesselId ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            asChild
          >
            <Link href={`/dashboard/tracking?vessel=${vesselId}`}>
              <Ship className="mr-1 h-3 w-3" />
              Track
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled
            title="No vessel assigned"
          >
            Track
          </Button>
        )
      },
    },
    {
      accessorKey: 'bill_of_lading',
      header: 'Bill of Lading',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'origin_port',
      header: 'Origin Port',
      cell: ({ row }) => row.original.origin_port || '-',
    },
    {
      accessorKey: 'destination_port',
      header: 'Destination Port',
      cell: ({ row }) => row.original.destination_port || '-',
    },
    {
      accessorKey: 'registration_date',
      header: 'Registration Date',
      cell: ({ row }) =>
        row.original.registration_date
          ? format(new Date(row.original.registration_date), 'MMM dd, yyyy')
          : '-',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/containers/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditClick(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteClick(row.original)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Container Tracking</h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage all your container shipments
          </p>
        </div>
        <Button onClick={handleRegisterClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Register Container
        </Button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Containers"
          value={stats.total}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="In Transit"
          value={stats.inTransit}
          icon={Ship}
          color="blue"
        />
        <StatsCard
          title="Cleared"
          value={stats.cleared}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="High Risk"
          value={stats.highRisk}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        ports={ports}
        isLoading={isLoading}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={containersData?.data || []}
        currentPage={page}
        pageSize={pageSize}
        totalItems={containersData?.total || 0}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
        emptyState={{
          icon: Package,
          title: 'No containers found',
          description: 'Start by registering your first container shipment.',
          action: {
            label: 'Register Container',
            onClick: handleRegisterClick,
          },
        }}
      />

      {/* Container Dialog */}
      <ContainerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        container={selectedContainer}
      />
    </div>
  )
}
