'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin dashboard error:', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="flex flex-col items-center space-y-2 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
        <p className="max-w-md text-gray-600">
          Failed to load the admin dashboard. Please try again.
        </p>
        {error.message && (
          <p className="mt-2 text-sm text-gray-500">Error: {error.message}</p>
        )}
      </div>
      <Button onClick={reset} className="mt-4">
        Try Again
      </Button>
    </div>
  )
}
