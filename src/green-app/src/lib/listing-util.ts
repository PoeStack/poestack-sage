import { SageItemGroupSummaryShard } from '@/types/echo-api/item-group'
import { SageValuationShard } from '@/types/echo-api/valuation'
import {
  SageDatabaseOfferingType,
  SageListingItemType,
  SageListingType,
  SageSelectedDatabaseOfferingItemType
} from '@/types/sage-listing-type'
import { DEFAULT_VALUATION_INDEX } from './constants'
import { ListingCategory } from './listing-categories'

type SageSpecialOfferingType = Omit<SageDatabaseOfferingType, 'items'> & {
  items: SageSelectedDatabaseOfferingItemType[]
}

export const calculateListingFromOfferingListing = (
  offering: SageSpecialOfferingType,
  summaries: SageItemGroupSummaryShard['summaries'],
  valuations: SageValuationShard['valuations'],
  categoryTagItem?: ListingCategory
): SageListingType => {
  const items = offering.items.map((e): SageListingItemType => {
    const valuation = valuations[e.hash]

    const item: SageListingItemType = {
      hash: e.hash,
      price: e.price,
      quantity: e.quantity,
      displayName: summaries[e.hash]?.displayName,
      calculatedTotalPrice: (e.selectedQuantity ?? e.quantity) * e.price,
      primaryValuation: valuation?.pValues?.[DEFAULT_VALUATION_INDEX] ?? 0,
      valuation: valuation,
      summary: summaries[e.hash],
      icon: summaries[e.hash]?.icon,
      selectedQuantity: e.selectedQuantity ?? e.quantity
    }

    if (item.primaryValuation <= 0) {
      console.log('NOT FOUND', e)
    }
    return item
  })

  const calculatedTotalPrice = items.reduce((a, b) => a + b.calculatedTotalPrice, 0)
  const calculatedTotalValuation = items.reduce((a, b) => a + b.primaryValuation * b.quantity, 0)
  let multiplier = 100
  if (calculatedTotalPrice && calculatedTotalValuation) {
    multiplier = (calculatedTotalPrice / calculatedTotalValuation) * 100
  }

  return {
    userId: offering.userId,
    uuid: offering.uuid,
    deleted: offering.deleted,
    meta: {
      ...offering.meta,
      multiplier,
      calculatedTotalPrice,
      calculatedTotalValuation,
      icon: categoryTagItem?.icon || '',
      altIcon: ''
    },
    items
  }
}
