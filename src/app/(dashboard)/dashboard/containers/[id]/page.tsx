'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  History,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import ContainerDialog from '@/components/containers/ContainerDialog'
import {
  useContainerDetail,
  useContainerHistory,
  useDeleteContainer,
} from '@/lib/hooks/useContainers'

export default function ContainerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const containerId = params.id as string

  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: container, isLoading } = useContainerDetail(containerId)
  const { data: history } = useContainerHistory(containerId)
  const deleteContainer = useDeleteContainer()

  const handleEdit = () => {
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!container) return

    if (
      !confirm(
        `Are you sure you want to delete container ${container.container_number}?`
      )
    ) {
      return
    }

    try {
      await deleteContainer.mutateAsync(containerId)
      router.push('/dashboard/containers')
    } catch (error) {
      console.error('Failed to delete container:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!container) {
    return (
      <EmptyState
        icon={Package}
        title="Container not found"
        description="The container you're looking for doesn't exist or you don't have access to it."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Link
          href="/dashboard/containers"
          className="flex items-center hover:text-gray-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Containers
        </Link>
        <span>/</span>
        <span className="text-gray-900">{container.container_number}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">
              {container.container_number}
            </h1>
            <StatusBadge status={container.status} size="lg" />
          </div>
          <p className="text-gray-600">
            Bill of Lading: {container.bill_of_lading}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Status History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Container Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Container Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Container Type</p>
                  <p className="font-medium">{container.container_type}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Seal Number</p>
                  <p className="font-medium">{container.seal_number || '-'}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Registration Date</p>
                  <p className="font-medium">
                    {container.registration_date
                      ? format(
                          new Date(container.registration_date),
                          'MMM dd, yyyy HH:mm'
                        )
                      : '-'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ports & Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Ports & Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Origin Port</p>
                  <p className="font-medium">
                    {container.origin_port || '-'}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Destination Port</p>
                  <p className="font-medium">
                    {container.destination_port || '-'}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">ETA</p>
                  <p className="font-medium">
                    {container.eta
                      ? format(new Date(container.eta), 'MMM dd, yyyy HH:mm')
                      : '-'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Shipper Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Shipper Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{container.shipper_name}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">
                    {container.shipper_address || '-'}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Country</p>
                  <p className="font-medium">
                    {container.shipper_country || '-'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Consignee Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Consignee Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{container.consignee_name}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">
                    {container.consignee_address || '-'}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Country</p>
                  <p className="font-medium">
                    {container.consignee_country || '-'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cargo Details */}
          <Card>
            <CardHeader>
              <CardTitle>Cargo Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium">{container.cargo_description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Commodity Type</p>
                  <p className="font-medium">
                    {container.commodity_type || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">HS Code</p>
                  <p className="font-medium">{container.hs_code || '-'}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-medium">
                    {container.weight_kg ? `${container.weight_kg} kg` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Volume</p>
                  <p className="font-medium">
                    {container.volume_cbm ? `${container.volume_cbm} m³` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Value</p>
                  <p className="font-medium">
                    {container.value_usd
                      ? `$${container.value_usd.toLocaleString()}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-medium">
                    {container.quantity
                      ? `${container.quantity} ${container.quantity_unit || ''}`
                      : '-'}
                  </p>
                </div>
              </div>
              {container.is_hazardous && (
                <>
                  <Separator />
                  <div className="rounded-lg bg-red-50 p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-semibold text-red-900">
                          Hazardous Material
                        </p>
                        <p className="text-sm text-red-700">
                          {container.hazard_class || 'Class not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-start space-x-4 border-l-2 border-gray-200 pl-4"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={entry.status as any} size="sm" />
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-gray-600">{entry.notes}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {format(new Date(entry.changed_at), 'MMM dd, yyyy HH:mm')}
                          {entry.changed_by_user && (
                            <> by {entry.changed_by_user.full_name}</>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={History}
                  title="No status history"
                  description="Status changes will appear here."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab (Placeholder) */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={FileText}
                title="Documents coming soon"
                description="Document management will be available in a future update."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <ContainerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode="edit"
        container={container}
      />
    </div>
  )
}
