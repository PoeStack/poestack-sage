import { SageListingType } from '@/types/sage-listing-type'
import { RowSelectionState } from '@tanstack/react-table'
import hash from 'object-hash'

export const generateHashFromListing = (
  listing: SageListingType,
  selectedItemsMap: RowSelectionState
) => {
  if (listing.meta.listingMode === 'bulk') {
    // No hash needed
    return listing.uuid
  }
  const selectedItems = listing.items.filter(
    (item) => selectedItemsMap[item.hash] && item.selectedQuantity > 0
  )
  if (selectedItems.length === 0) {
    return false
  }
  if (
    selectedItems.length === listing.items.length &&
    selectedItems.every((x) => x.selectedQuantity >= x.quantity)
  ) {
    // Shortcut --- no hash needed
    return listing.uuid
  }
  const preparedItems = selectedItems.map((item) => {
    return [item.hash, item.selectedQuantity ?? 0]
  })
  return hash([listing.uuid, preparedItems])
}
