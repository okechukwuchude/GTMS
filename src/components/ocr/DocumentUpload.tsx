/**
 * Document Upload Component
 * Drag-and-drop file upload for bill of lading documents
 */

'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileText, Upload, X, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useDocumentUpload } from '@/lib/hooks/useDocumentUpload'
import { OCRStatusBadge } from './OCRStatusBadge'
import { OCRResult } from '@/lib/ocr/types'

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/tiff': ['.tiff', '.tif'],
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export interface DocumentUploadProps {
  onUploadSuccess?: (ocrResult: OCRResult) => void
  onUploadError?: (error: Error) => void
  className?: string
}

/**
 * Document Upload Component
 */
export function DocumentUpload({
  onUploadSuccess,
  onUploadError,
  className,
}: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress] = useState(0)

  // Upload mutation
  const {
    mutate: uploadDocument,
    isPending,
    isSuccess,
    isError,
    error,
    data: ocrResult,
  } = useDocumentUpload({
    onSuccess: (data) => {
      onUploadSuccess?.(data)
    },
    onError: (err) => {
      onUploadError?.(err)
    },
  })

  // File drop handler
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setSelectedFile(file)
        uploadDocument(file)
      }
    },
    [uploadDocument]
  )

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_FILE_TYPES,
      maxFiles: 1,
      maxSize: MAX_FILE_SIZE,
      disabled: isPending,
    })

  // Clear selection and reset
  const handleClear = () => {
    setSelectedFile(null)
  }

  // Get file icon
  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="h-8 w-8" />

    const ext = selectedFile.name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    return <File className="h-8 w-8 text-blue-500" />
  }

  // Get status
  const getStatus = (): 'idle' | 'processing' | 'success' | 'error' => {
    if (isPending) return 'processing'
    if (isSuccess) return 'success'
    if (isError) return 'error'
    return 'idle'
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={cn(
            'relative cursor-pointer rounded-lg border-2 border-dashed p-8 transition-colors',
            'hover:border-primary/50 hover:bg-accent/50',
            isDragActive && 'border-primary bg-accent',
            isPending && 'cursor-not-allowed opacity-50',
            'flex flex-col items-center justify-center gap-4 text-center'
          )}
        >
          <input {...getInputProps()} />

          {/* Icon */}
          <div
            className={cn(
              'rounded-full bg-accent p-4',
              isDragActive && 'bg-primary/20'
            )}
          >
            {getFileIcon()}
          </div>

          {/* Text */}
          <div className="space-y-1">
            {isDragActive ? (
              <p className="text-sm font-medium">Drop file here</p>
            ) : selectedFile ? (
              <>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">
                  Drag and drop your bill of lading here
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse files
                </p>
              </>
            )}
          </div>

          {/* File type hint */}
          {!selectedFile && !isDragActive && (
            <p className="text-xs text-muted-foreground">
              Supports PDF, JPG, PNG, TIFF (max 10MB)
            </p>
          )}

          {/* Clear button */}
          {selectedFile && !isPending && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Upload Progress */}
        {isPending && (
          <div className="space-y-2">
            <Progress value={uploadProgress || 50} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Processing document... This may take 10-30 seconds
            </p>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex justify-center">
          <OCRStatusBadge
            status={getStatus()}
            confidence={ocrResult?.overallConfidence}
            error={error?.message}
          />
        </div>

        {/* File Rejections */}
        {fileRejections.length > 0 && (
          <div className="rounded-md bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              {fileRejections[0].errors[0].message}
            </p>
          </div>
        )}

        {/* Success Message */}
        {isSuccess && ocrResult && (
          <div className="rounded-md bg-green-50 p-3 dark:bg-green-950">
            <p className="text-sm text-green-800 dark:text-green-200">
              Document processed successfully! {ocrResult.fields.container_number?.value && `Container: ${ocrResult.fields.container_number.value}`}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
