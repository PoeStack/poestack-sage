'use client'

import { PropsWithChildren } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './ui/alert-dialog'
import { useListingToolStore } from '@/app/[locale]/listing-tool/listingToolStore'
import { useListingsStore } from '@/app/[locale]/listings/listingsStore'
import { useTranslation } from 'react-i18next'

function FallbackRender({ error, resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation()
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Oops ... Something went wrong</AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-2">
            <div>{t('body.fallbackRenderInfo')}</div>
            <div className="text-red-400">{error.message}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => resetErrorBoundary()}>
            {t('action.hardReset')}
          </AlertDialogAction>
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
      fallbackRender={FallbackRender}
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
