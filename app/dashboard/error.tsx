'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-destructive">Something went wrong!</h2>
        <p className="mt-2 text-muted-foreground">
          An error occurred while loading the dashboard. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <p className="mt-2 text-sm text-muted-foreground">
            {error.message}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </div>
    </div>
  )
}
