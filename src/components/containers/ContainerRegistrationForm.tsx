'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
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
import { useCreateContainer, useUpdateContainer } from '@/lib/hooks/useContainers'
import { Container } from '@/types/container.types'
import { OCRResult } from '@/lib/ocr/types'
import { FieldConfidenceIndicator } from '@/components/ocr/FieldConfidenceIndicator'
import { Loader2 } from 'lucide-react'

interface ContainerRegistrationFormProps {
  mode: 'create' | 'edit'
  container?: Container
  ocrData?: OCRResult
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
  ocrData,
  onSuccess,
  onCancel,
}: ContainerRegistrationFormProps) {
  const createContainer = useCreateContainer()
  const updateContainer = useUpdateContainer()

  // Helper function to get OCR field value
  const getOCRValue = (fieldName: string) => {
    if (!ocrData?.fields) return undefined
    const field = ocrData.fields[fieldName as keyof typeof ocrData.fields]
    return field?.value
  }

  // Helper function to get OCR field confidence
  const getOCRConfidence = (fieldName: string) => {
    if (!ocrData?.fields) return undefined
    const field = ocrData.fields[fieldName as keyof typeof ocrData.fields]
    return field?.confidence
  }


  const form = useForm<any>({
    resolver: zodResolver(containerCreateSchema) as any,
    defaultValues: {
      container_number: container?.container_number || getOCRValue('container_number') || '',
      bill_of_lading: container?.bill_of_lading || getOCRValue('bill_of_lading') || '',
      seal_number: container?.seal_number || getOCRValue('seal_number') || '',
      container_type: container?.container_type || getOCRValue('container_type') || '20FT',
      shipper_name: container?.shipper_name || getOCRValue('shipper_name') || '',
      shipper_address: container?.shipper_address || getOCRValue('shipper_address') || '',
      shipper_country: container?.shipper_country || getOCRValue('shipper_country') || '',
      consignee_name: container?.consignee_name || getOCRValue('consignee_name') || '',
      consignee_address: container?.consignee_address || getOCRValue('consignee_address') || '',
      consignee_country: container?.consignee_country || getOCRValue('consignee_country') || '',
      cargo_description: container?.cargo_description || getOCRValue('cargo_description') || '',
      commodity_type: container?.commodity_type || getOCRValue('commodity_type') || '',
      hs_code: container?.hs_code || getOCRValue('hs_code') || '',
      quantity: container?.quantity || getOCRValue('quantity') || undefined,
      quantity_unit: container?.quantity_unit || getOCRValue('quantity_unit') || '',
      weight_kg: container?.weight_kg || getOCRValue('weight_kg') || undefined,
      volume_cbm: container?.volume_cbm || getOCRValue('volume_cbm') || undefined,
      value_usd: container?.value_usd || getOCRValue('value_usd') || undefined,
      currency: container?.currency || getOCRValue('currency') || 'USD',
      is_hazardous: container?.is_hazardous || getOCRValue('is_hazardous') || false,
      hazard_class: (container?.hazard_class as any) || getOCRValue('hazard_class') || undefined,
      vessel_name: container?.vessel_name || getOCRValue('vessel_name') || undefined,
      vessel_mmsi: container?.vessel_mmsi || getOCRValue('vessel_mmsi') || undefined,
      origin_port: container?.origin_port || getOCRValue('origin_port') || undefined,
      destination_port: container?.destination_port || getOCRValue('destination_port') || undefined,
      eta: container?.eta || getOCRValue('eta') || undefined,
      temperature_celsius: container?.temperature_celsius || getOCRValue('temperature_celsius') || undefined,
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
    // Include OCR metadata if container was created from OCR
    const submissionData = {
      ...data,
      ...(ocrData && {
        ocr_processed: true,
        ocr_confidence: ocrData.overallConfidence,
        ocr_data: ocrData,
      }),
    }

    if (mode === 'create') {
      await createContainer.mutateAsync(submissionData)
    } else if (container) {
      await updateContainer.mutateAsync({
        id: container.id,
        data: submissionData,
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

        {/* Section 5: Vessel Information */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Vessel Information</h3>
            <p className="text-sm text-gray-600">
              Information about the vessel transporting this container
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="vessel_name"
              render={({ field }) => {
                const isOCRExtracted = ocrData?.fields?.vessel_name !== undefined

                return (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Vessel Name
                      {isOCRExtracted && ocrData?.fields?.vessel_name && (
                        <FieldConfidenceIndicator
                          fieldName="Vessel Name"
                          confidence={ocrData.fields.vessel_name.confidence}
                          isOCRExtracted={true}
                        />
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter vessel name (e.g., MV MAERSK ESSEX)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Name of the vessel carrying this container
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <FormField
              control={form.control}
              name="vessel_mmsi"
              render={({ field }) => {
                const isOCRExtracted = ocrData?.fields?.vessel_mmsi !== undefined

                return (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Vessel MMSI
                      {isOCRExtracted && ocrData?.fields?.vessel_mmsi && (
                        <FieldConfidenceIndicator
                          fieldName="Vessel MMSI"
                          confidence={ocrData.fields.vessel_mmsi.confidence}
                          isOCRExtracted={true}
                        />
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 9-digit MMSI number"
                        {...field}
                        maxLength={20}
                      />
                    </FormControl>
                    <FormDescription>
                      Maritime Mobile Service Identity number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>
        </div>

        <Separator />

        {/* Section 6: Ports & Schedule */}
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
              name="origin_port"
              render={({ field }) => {
                // Check if OCR extracted to show confidence indicator
                const isOCRExtracted = ocrData?.fields?.origin_port !== undefined

                return (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Origin Port
                      {isOCRExtracted && ocrData?.fields?.origin_port && (
                        <FieldConfidenceIndicator
                          fieldName="Origin Port"
                          confidence={ocrData.fields.origin_port.confidence}
                          isOCRExtracted={true}
                        />
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter port name or code (e.g., NGLOS, Lagos)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter port name or UN/LOCODE
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <FormField
              control={form.control}
              name="destination_port"
              render={({ field }) => {
                // Check if OCR extracted to show confidence indicator
                const isOCRExtracted = ocrData?.fields?.destination_port !== undefined

                return (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Destination Port
                      {isOCRExtracted && ocrData?.fields?.destination_port && (
                        <FieldConfidenceIndicator
                          fieldName="Destination Port"
                          confidence={ocrData.fields.destination_port.confidence}
                          isOCRExtracted={true}
                        />
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter port name or code (e.g., USNYC, New York)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter port name or UN/LOCODE
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )
              }}
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
