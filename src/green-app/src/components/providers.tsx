'use client'

import { useToast } from '@/hooks/useToast'
import { UserInfo } from '@/types/userInfo'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Provider, atom, createStore } from 'jotai'
import { ReactNode, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import ErrorBoundaryContainer from './error-boundary-container'
import Notifier from './notifier'
import { useTranslation } from 'react-i18next'

const leagueDivineStore = createStore()
export const currentDivinePriceAtom = atom<number>(0)
leagueDivineStore.set(currentDivinePriceAtom, 0)

export const currentUserAtom = atom<UserInfo | null>(null)

export const atomStore = createStore()

type ProvidersProps = {
  children?: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const { t } = useTranslation('notification')
  const toast = useToast()
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            // 🎉 only show error toasts if we already have data in the cache
            // which indicates a failed background update
            console.error(error)
            if (query.state.data !== undefined) {
              toast(t('error.unknown_error', { message: error.message }), 'error')
            }
          }
        })
      })
  )

  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    })
  )

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <Provider store={atomStore}>
        {process.env.NODE_ENV !== 'production' ? (
          children
        ) : (
          <ErrorBoundaryContainer>{children}</ErrorBoundaryContainer>
        )}
        <ToastProvider />
        <Notifier />
      </Provider>
      <ReactQueryDevtools />
    </PersistQueryClientProvider>
  )
}

const ToastProvider = () => {
  return (
    <ToastContainer
      style={{ top: 'max(4rem,(var(--toastify-toast-top))' }}
      toastClassName="border"
      theme="dark"
      draggable
    />
  )
}
