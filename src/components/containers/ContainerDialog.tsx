'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUp, Keyboard } from 'lucide-react'
import ContainerRegistrationForm from './ContainerRegistrationForm'
import { DocumentUpload } from '@/components/ocr/DocumentUpload'
import { OCRReviewPanel } from '@/components/ocr/OCRReviewPanel'
import { Container } from '@/types/container.types'
import { OCRResult } from '@/lib/ocr/types'

interface ContainerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  containerId?: string
  container?: Container
  mode: 'create' | 'edit'
}

export default function ContainerDialog({
  open,
  onOpenChange,
  container,
  mode,
}: ContainerDialogProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual')
  const [ocrData, setOCRData] = useState<OCRResult | undefined>(undefined)
  const [showReviewPanel, setShowReviewPanel] = useState(false)

  const handleSuccess = () => {
    onOpenChange(false)
    // Reset state when dialog closes
    setOCRData(undefined)
    setShowReviewPanel(false)
    setActiveTab('manual')
  }

  const handleCancel = () => {
    onOpenChange(false)
    // Reset state when dialog closes
    setOCRData(undefined)
    setShowReviewPanel(false)
    setActiveTab('manual')
  }

  const handleUploadSuccess = (result: OCRResult) => {
    setOCRData(result)
    setShowReviewPanel(true)
  }

  const handleAcceptOCR = () => {
    // Close review panel and switch to form with OCR data
    setShowReviewPanel(false)
    setActiveTab('manual')
  }

  // Edit mode: only show manual entry form
  if (mode === 'edit') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Container</DialogTitle>
            <DialogDescription>
              Update the container information below.
            </DialogDescription>
          </DialogHeader>
          <ContainerRegistrationForm
            mode={mode}
            container={container}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    )
  }

  // Create mode: show tabs for manual entry or document upload
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Container</DialogTitle>
          <DialogDescription>
            Choose to manually enter details or upload a bill of lading document.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manual' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Upload Document
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-6">
            <ContainerRegistrationForm
              mode={mode}
              container={container}
              ocrData={ocrData}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-6 space-y-6">
            {!showReviewPanel ? (
              <DocumentUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={(error) => {
                  console.error('Upload error:', error)
                }}
              />
            ) : (
              <OCRReviewPanel
                ocrResult={ocrData!}
                onAcceptAll={handleAcceptOCR}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
