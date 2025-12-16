'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { containerCreateSchema, ContainerCreateInput } from '@/lib/validations/container.validations'
import { usePorts } from '@/lib/hooks/usePorts'
import { useCreateContainer, useUpdateContainer } from '@/lib/hooks/useContainers'
import { Container } from '@/types/container.types'
import { Loader2 } from 'lucide-react'

interface ContainerRegistrationFormProps {
  mode: 'create' | 'edit'
  container?: Container
  onSuccess?: () => void
  onCancel?: () => void
}

const containerTypes = [
  { value: '20FT', label: '20ft Standard' },
  { value: '40FT', label: '40ft Standard' },
  { value: '40FT_HC', label: '40ft High Cube' },
  { value: '45FT', label: '45ft High Cube' },
  { value: 'REEFER', label: 'Refrigerated' },
  { value: 'TANK', label: 'Tank' },
  { value: 'OPEN_TOP', label: 'Open Top' },
  { value: 'FLAT_RACK', label: 'Flat Rack' },
]

const hazardClasses = [
  'Class 1 - Explosives',
  'Class 2 - Gases',
  'Class 3 - Flammable Liquids',
  'Class 4 - Flammable Solids',
  'Class 5 - Oxidizing Substances',
  'Class 6 - Toxic Substances',
  'Class 7 - Radioactive Material',
  'Class 8 - Corrosive Substances',
  'Class 9 - Miscellaneous Dangerous Goods',
]

export default function ContainerRegistrationForm({
  mode,
  container,
  onSuccess,
  onCancel,
}: ContainerRegistrationFormProps) {
  const { data: ports, isLoading: portsLoading } = usePorts()
  const createContainer = useCreateContainer()
  const updateContainer = useUpdateContainer()

  const form = useForm<any>({
    resolver: zodResolver(containerCreateSchema) as any,
    defaultValues: {
      container_number: container?.container_number || '',
      bill_of_lading: container?.bill_of_lading || '',
      seal_number: container?.seal_number || '',
      container_type: container?.container_type || '20FT',
      shipper_name: container?.shipper_name || '',
      shipper_address: container?.shipper_address || '',
      shipper_country: container?.shipper_country || '',
      consignee_name: container?.consignee_name || '',
      consignee_address: container?.consignee_address || '',
      consignee_country: container?.consignee_country || '',
      cargo_description: container?.cargo_description || '',
      commodity_type: container?.commodity_type || '',
      hs_code: container?.hs_code || '',
      quantity: container?.quantity || undefined,
      quantity_unit: container?.quantity_unit || '',
      weight_kg: container?.weight_kg || undefined,
      volume_cbm: container?.volume_cbm || undefined,
      value_usd: container?.value_usd || undefined,
      currency: container?.currency || 'USD',
      is_hazardous: container?.is_hazardous || false,
      hazard_class: (container?.hazard_class as any) || undefined,
      origin_port_id: container?.origin_port_id || undefined,
      destination_port_id: container?.destination_port_id || undefined,
      eta: container?.eta || undefined,
      temperature_celsius: container?.temperature_celsius || undefined,
    },
  })

  const isHazardous = form.watch('is_hazardous')
  const containerType = form.watch('container_type')
  const isSubmitting = createContainer.isPending || updateContainer.isPending

  useEffect(() => {
    // Reset hazard_class if not hazardous
    if (!isHazardous) {
      form.setValue('hazard_class', undefined)
    }
  }, [isHazardous, form])

  useEffect(() => {
    // Reset temperature if not REEFER
    if (containerType !== 'REEFER') {
      form.setValue('temperature_celsius', undefined)
    }
  }, [containerType, form])

  async function onSubmit(data: ContainerCreateInput) {
    if (mode === 'create') {
      await createContainer.mutateAsync(data)
    } else if (container) {
      await updateContainer.mutateAsync({
        id: container.id,
        data,
      })
    }

    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Container Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Container Details</h3>
            <p className="text-sm text-gray-600">
              Basic information about the container
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="container_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Container Number *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ABCD1234567"
                      {...field}
                      disabled={mode === 'edit'}
                    />
                  </FormControl>
                  <FormDescription>
                    4 letters + 7 digits (ISO 6346)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bill_of_lading"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bill of Lading *</FormLabel>
                  <FormControl>
                    <Input placeholder="BOL-2024-001" {...field} />
                  </FormControl>
                  <FormDescription>
                    Unique document identifier for this shipment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seal_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seal Number</FormLabel>
                  <FormControl>
                    <Input placeholder="SEAL123456" {...field} />
                  </FormControl>
                  <FormDescription>
                    Security seal identifier (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="container_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Container Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select container type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {containerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Section 2: Shipper Information */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Shipper Information</h3>
            <p className="text-sm text-gray-600">
              Details about the shipping party
            </p>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="shipper_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipper Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC Shipping Company" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shipper_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Shipper Address ({field.value?.length || 0} characters)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="123 Main Street, City, State, ZIP"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Complete address of the shipping party
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shipper_country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipper Country</FormLabel>
                  <FormControl>
                    <Input placeholder="United States" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Section 3: Consignee Information */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Consignee Information
            </h3>
            <p className="text-sm text-gray-600">
              Details about the receiving party
            </p>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="consignee_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consignee Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="XYZ Import Company" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consignee_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Consignee Address ({field.value?.length || 0} characters)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="456 Harbor Road, City, State, ZIP"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Complete address of the receiving party
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consignee_country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consignee Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Nigeria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Section 4: Cargo Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cargo Details</h3>
            <p className="text-sm text-gray-600">
              Information about the cargo contents
            </p>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="cargo_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Cargo Description * ({field.value?.length || 0} characters)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the cargo contents..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information about the cargo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="commodity_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commodity Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Electronics, Textiles, etc." {...field} />
                    </FormControl>
                    <FormDescription>General category of goods</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hs_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HS Code</FormLabel>
                    <FormControl>
                      <Input placeholder="8471.30.01" {...field} />
                    </FormControl>
                    <FormDescription>Harmonized System Code</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>Number of units</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="Pallets, Boxes, Units" {...field} />
                    </FormControl>
                    <FormDescription>Unit of measurement</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="weight_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>Total weight in kilograms</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="volume_cbm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume (m³)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="33.2"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>Volume in cubic meters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value_usd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>Declared value in US dollars</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <FormField
                control={form.control}
                name="is_hazardous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Hazardous Materials</FormLabel>
                      <FormDescription>
                        Check if cargo contains dangerous goods
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {isHazardous && (
                <FormField
                  control={form.control}
                  name="hazard_class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hazard Class *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hazard class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {hazardClasses.map((hazardClass) => (
                            <SelectItem key={hazardClass} value={hazardClass}>
                              {hazardClass}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Section 5: Ports & Schedule */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Ports & Schedule
            </h3>
            <p className="text-sm text-gray-600">
              Origin, destination, and timing information
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="origin_port_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin Port</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={portsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select origin port" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ports?.map((port) => (
                        <SelectItem key={port.id} value={port.id}>
                          {port.name} ({port.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destination_port_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Port</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={portsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination port" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ports?.map((port) => (
                        <SelectItem key={port.id} value={port.id}>
                          {port.name} ({port.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Time of Arrival</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>
                    Expected arrival date and time at destination
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {containerType === 'REEFER' && (
              <FormField
                control={form.control}
                name="temperature_celsius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature (°C) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="-18"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Required for refrigerated containers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Register Container' : 'Update Container'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
