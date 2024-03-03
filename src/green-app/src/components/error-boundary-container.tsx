'use client'

import { PropsWithChildren } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { useListingsStore } from '@/app/listings/listingsStore'
import { useListingToolStore } from '@/app/listing-tool/listingToolStore'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './ui/alert-dialog'

function fallbackRender({ error, resetErrorBoundary }: FallbackProps) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Oops ... Something went wrong</AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-2">
            <div>
              If you confirm, all dates will be reset. To fix the bug, it would help to report it.
              Thanks!
            </div>
            <div className="text-red-400">{error.message}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => resetErrorBoundary()}>Reset Data</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

type ErrorBoundaryContainerProps = PropsWithChildren & {}

const ErrorBoundaryContainer = ({ children }: ErrorBoundaryContainerProps) => {
  const resetListinsStore = useListingsStore((state) => state.reset)
  const resetListingToolStore = useListingToolStore((state) => state.reset)

  return (
    <ErrorBoundary
      fallbackRender={fallbackRender}
      onReset={(details) => {
        // Reset the state of your app so the error doesn't happen again
        resetListinsStore()
        resetListingToolStore()
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundaryContainer
