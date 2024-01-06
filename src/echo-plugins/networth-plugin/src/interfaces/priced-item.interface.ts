import { SageValuation } from 'echo-common'
import { ICompactTab } from './stash.interface'
import { PoeItem, SageItemGroup } from 'sage-common'

// The persisted priced item
export interface IPricedItem {
  uuid: string
  percentile: number
  group?: SageItemGroup
  valuation: SageValuation | undefined
  items: PoeItem[]
  tab: ICompactTab[]
}

// The hydrated displayed item
export interface IDisplayedItem extends IPricedItem {
  displayName: string
  calculated: number
  total: number
  stackSize: number
  totalStacksize: number
  icon: string
  frameType: number
}
