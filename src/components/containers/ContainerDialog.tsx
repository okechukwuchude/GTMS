'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ContainerRegistrationForm from './ContainerRegistrationForm'
import { Container } from '@/types/container.types'

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
  const handleSuccess = () => {
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Register New Container' : 'Edit Container'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Fill in the container details below to register a new shipment.'
              : 'Update the container information below.'}
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
