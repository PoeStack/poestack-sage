import { useListingsStore } from '@/app/listings/listingsStore'
import { generateHashFromListing } from '@/lib/hash-utils'
import { NotificationCreate, postNotifications } from '@/lib/http-util'
import { SageListingType } from '@/types/sage-listing-type'
import { useMutation } from '@tanstack/react-query'
import { RowSelectionState } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

// Hash; SelectedQuantity
export type NotificationItem = [string, number]

export type NotificationBody = {
  uuid: string
  items: NotificationItem[]
}

const createNotificationBody = (
  listing: SageListingType,
  selectedItemsMap: RowSelectionState
): NotificationBody => {
  const body: NotificationBody = {
    uuid: listing.uuid,
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
): [boolean, boolean, boolean, (() => void) | undefined] => {
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
        if (!state.whisperedListings[listing.uuid]?.sentHashes.includes(generatedHash)) {
          console.log('Send notification')
          const body: any = {}
          body.uuid = listing.uuid
          body.items = listing.items

          mutation.mutate({
            targetId: listing.userId,
            type: 'offering-buy', // Maybe offering-buy-update later to update the promise
            body: createNotificationBody(listing, selectedItemsMap)
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

  return [disabled, messageCopied, messageSent, setMessageCopied]
}
