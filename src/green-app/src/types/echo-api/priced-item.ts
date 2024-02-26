// Ref networth-plugin

import { SageItemGroup } from '@/lib/item-grouping-service'
import { SageValuation } from './valuation'
import { PoeItem } from '../poe-api-models'
import { ICompactTab } from './stash'

// The persisted priced item
export interface IPricedItem {
  // uuid: string
  percentile: number
  group?: SageItemGroup
  valuation: SageValuation | undefined
  items: PoeItem[]
  tabs: ICompactTab[]
}

// The hydrated displayed item
export interface IDisplayedItem extends IPricedItem {
  displayName: string
  originalPrice?: number
  calculatedPrice?: number
  calculatedTotal: number
  stackSize: number
  totalStacksize: number
  icon: string
  frameType: number

  selectedPrice?: number
}
