import { SageListingItemType, SageListingType } from '@/types/sage-listing-type'
import { round } from './currency'
import { TFunction } from 'i18next'

export const createWishperAndCopyToClipboard = (
  divinePrice: number,
  selectedListing: SageListingType,
  selectedItems: SageListingItemType[],
  t: TFunction<'common', undefined>
) => {
  // TODO: Add locale to listing and translate it to the target language
  const translateCategory = (categoryName: string) => {
    // t(`categories.${categoryName}` as any)
    categoryName
  }

  const getTabWhisper = () => {
    const divines = Math.trunc(selectedListing.meta.calculatedTotalPrice / divinePrice)
    const chaos = selectedListing.meta.calculatedTotalPrice % divinePrice
    const singleItemTradeMode = selectedListing.meta.listingMode === 'single' ? 'ALL' : ''
    if (chaos === 0) {
      return `@${selectedListing.meta.ign} WTB ${singleItemTradeMode} ${translateCategory(selectedListing.meta.subCategory || selectedListing.meta.category)} listing for ${divines}d`
    } else {
      if (divines === 0) {
        return `@${selectedListing.meta.ign} WTB ${singleItemTradeMode} ${translateCategory(selectedListing.meta.subCategory || selectedListing.meta.category)} listing for ${round(chaos)}c`
      } else {
        return `@${selectedListing.meta.ign} WTB ${singleItemTradeMode} ${translateCategory(selectedListing.meta.subCategory || selectedListing.meta.category)} listing for ${divines}d ${round(chaos)}c`
      }
    }
  }
  if (selectedListing.meta.listingMode === 'bulk') {
    // @XXX WTB Essences listing for 1d 9c
    navigator.clipboard.writeText(getTabWhisper())
  } else if (selectedItems.length > 0) {
    // @XXX WTB 1 Breach 6c each, 3 Alva 20c each. Total 66c
    if (
      selectedItems.length === selectedListing.items.length &&
      selectedItems.every((x) => x.selectedQuantity >= x.quantity)
    ) {
      navigator.clipboard.writeText(getTabWhisper())
    } else {
      const formattedText = selectedItems
        .filter((item) => item.selectedQuantity > 0 && item.price)
        .map((item) => `${item.selectedQuantity} ${item.displayName} ${round(item.price)}c each`)
        .join(', ')
      const totalPrice = selectedItems.reduce((a, b) => a + b.price * (b.selectedQuantity ?? 0), 0)
      const divines = Math.trunc(totalPrice / divinePrice)
      const chaos = totalPrice % divinePrice
      if (divines > 0 && chaos > 0) {
        navigator.clipboard.writeText(
          `@${selectedListing.meta.ign} WTB ${formattedText}. Total ${divines}d ${round(chaos)}c`
        )
      } else if (divines > 0) {
        navigator.clipboard.writeText(
          `@${selectedListing.meta.ign} WTB ${formattedText}. Total ${divines}d`
        )
      } else {
        navigator.clipboard.writeText(
          `@${selectedListing.meta.ign} WTB ${formattedText}. Total ${round(chaos)}c`
        )
      }
    }
  }
}
