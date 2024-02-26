'use client'

import { useDivinePrice } from '@/hooks/useDivinePrice'
import { UserInfo } from '@/types/userInfo'
import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider, atom, createStore } from 'jotai'
import { ReactNode, useState } from 'react'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { ToastContainer, toast } from 'react-toastify'
import Notifier from './notifier'

// type DivineLeagues = {
//   divinePrice: Record<string, number>
//   league: string | null
//   setDivinePrice: (divinePrice: number, league: string) => void
// }

// export const useDivineStore = create<DivineLeagues>((set) => ({
//   divinePrice: {},
//   league: null,
//   setDivinePrice: (divinePrice, league) =>
//     set((state) => ({ divinePrice: { ...state.divinePrice, [league]: divinePrice } }))
// }))

const leagueDivineStore = createStore()
export const currentDivinePriceAtom = atom<number>(0)
leagueDivineStore.set(currentDivinePriceAtom, 0)

// TODO: Remove later
const unsub = leagueDivineStore.sub(currentDivinePriceAtom, () => {
  console.log('divinePrice value is changed to', leagueDivineStore.get(currentDivinePriceAtom))
})

export const currentUserAtom = atom<UserInfo | null>(null)

export const atomStore = createStore()

type ProvidersProps = {
  children?: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient())

  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    })
  )

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <Provider store={atomStore}>
        {children}
        <ToastContainer theme="dark" />
        <Notifier />
      </Provider>
      <ReactQueryDevtools />
    </PersistQueryClientProvider>
  )
}

// export const DivineProvider = ({
//   children,
//   league
// }: ProvidersProps & { league?: string | null }) => {
//   return (
//     <Provider store={leagueDivineStore}>
//       {league ? <DivineSetter league={league}>{children}</DivineSetter> : children}
//     </Provider>
//   )
// }

// export const DivineSetter = ({ children, league }: ProvidersProps & { league: string | null }) => {
//   useDivinePrice(league)

//   return children
// }
