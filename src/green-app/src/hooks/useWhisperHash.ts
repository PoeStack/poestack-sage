import { useListingsStore } from '@/app/listings/listingsStore'
import { currentUserAtom } from '@/components/providers'
import { generateHashFromListing } from '@/lib/hash-utils'
import { NotificationCreate, listCharacters, postNotifications } from '@/lib/http-util'
import { PoeCharacter } from '@/types/poe-api-models'
import { SageListingType } from '@/types/sage-listing-type'
import { useMutation, useQuery } from '@tanstack/react-query'
import { RowSelectionState } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

// Hash; SelectedQuantity
export type NotificationItem = [string, number]

export type NotificationBody = {
  uuid: string
  ign: string
  items: NotificationItem[]
}

const createNotificationBody = (
  listing: SageListingType,
  selectedItemsMap: RowSelectionState,
  ign: string
): NotificationBody => {
  const body: NotificationBody = {
    uuid: listing.uuid,
    ign,
    items: []
  }
  if (listing.meta.listingMode === 'bulk') {
    return body
  }
  const selectedItems = listing.items.filter(
    (item) => selectedItemsMap[item.hash] && item.selectedQuantity > 0
  )
  if (
    !(
      selectedItems.length === listing.items.length &&
      selectedItems.every((x) => x.selectedQuantity >= x.quantity)
    )
  ) {
    body.items = selectedItems.map((item) => {
      return [item.hash, item.selectedQuantity]
    })
  }

  return body
}

export const useWhisperHashCopied = (
  listing: SageListingType
): [boolean, boolean, boolean, boolean, (() => void) | undefined] => {
  const currentUser = useAtomValue(currentUserAtom)

  const selectCurrentCharacter = useCallback((characters: PoeCharacter[] | undefined) => {
    const currentChar = characters?.find((c) => c.current)
    return currentChar?.name
  }, [])

  const { data: currentIgn, isFetching: isCharactersFetching } = useQuery({
    queryKey: [currentUser?.profile?.uuid, 'characters'],
    queryFn: () => listCharacters(),
    select: selectCurrentCharacter,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!currentUser?.profile?.uuid
  })

  const mutation = useMutation({
    mutationFn: (notification: NotificationCreate) => postNotifications(notification)
  })

  const [selectedItemsMap] = useListingsStore(
    useShallow((state) => [state.selectedItemsMap[listing.uuid]])
  )
  const generatedHash = useMemo(() => {
    if (!selectedItemsMap) return false
    if (!listing) return false
    return generateHashFromListing(listing, selectedItemsMap)
  }, [listing, selectedItemsMap])

  const disabled = generatedHash === false

  const [messageCopied, messageSent, setMessageCopied] = useListingsStore(
    useShallow((state): [boolean, boolean, (() => void) | undefined] => {
      if (!generatedHash) return [false, false, undefined]
      const setMessageCopiedFn = () => {
        if (
          !state.whisperedListings[listing.uuid]?.sentHashes.includes(generatedHash) &&
          currentIgn
        ) {
          console.log('Send notification')
          const body: any = {}
          body.uuid = listing.uuid
          body.items = listing.items

          mutation.mutate({
            targetId: listing.userId,
            type: 'offering-buy', // Maybe offering-buy-update later to update the promise
            body: createNotificationBody(listing, selectedItemsMap, currentIgn)
          })
        }
        state.addWhisperedListing(listing.uuid, generatedHash)
      }
      if (!state.whisperedListings[listing.uuid]) {
        return [false, false, setMessageCopiedFn]
      }
      return [
        state.whisperedListings[listing.uuid].lastCopiedHash === generatedHash,
        state.whisperedListings[listing.uuid].sentHashes.includes(generatedHash),
        setMessageCopiedFn
      ]
    })
  )

  return [
    disabled,
    mutation.isPending || isCharactersFetching,
    messageCopied,
    messageSent,
    setMessageCopied
  ]
}
