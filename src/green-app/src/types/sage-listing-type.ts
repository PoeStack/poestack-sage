import { SageItemGroupSummaryShard } from './echo-api/item-group'
import { SageValuation } from './echo-api/valuation'

export type ListingMode = 'single' | 'bulk'

export type SageDatabaseOfferingItemType = {
  hash: string
  quantity: number
  price: number
}

export type SageDatabaseOfferingType = {
  uuid: string // Unique identifier across relistings
  userId: string
  meta: {
    league: string
    category: string
    subCategory: string
    ign: string
    timestampMs: number
    listingMode: ListingMode
    tabs: string[]
  }
  deleted?: boolean | undefined | null
  items: SageDatabaseOfferingItemType[]
}

export type SageOfferingType = Omit<SageDatabaseOfferingType, 'meta'> & {
  meta: {
    league: string
    category: string
    ign: string
    timestampMs: number
    listingMode: ListingMode
    tabs: string[]
    totalPrice: number
  }
}

export type SageListingItemType = SageDatabaseOfferingItemType & {
  displayName: string
  calculatedTotalPrice: number
  primaryValuation: number
  valuation: SageValuation
  summary: SageItemGroupSummaryShard['summaries'][number]
  icon: string
  selectedQuantity: number
}

export type SageListingType = Omit<SageDatabaseOfferingType, 'items'> & {
  meta: {
    multiplier: number
    calculatedTotalPrice: number
    calculatedTotalValuation: number
    icon: string
    altIcon: string
  }
  items: SageListingItemType[]
}

export type SageNotificationsItemType = SageDatabaseOfferingItemType & {
  displayName: string
  calculatedTotalPrice: number
  primaryValuation: number
  valuation: SageValuation
  summary: SageItemGroupSummaryShard['summaries'][number]
  icon: string
  selectedQuantity: number
}

export type SageNotificationListingType = Omit<SageDatabaseOfferingType, 'items'> & {
  meta: {
    multiplier: number
    calculatedTotalPrice: number
    calculatedTotalValuation: number
    icon: string
    altIcon: string
  }
  items: SageNotificationsItemType[]
}
