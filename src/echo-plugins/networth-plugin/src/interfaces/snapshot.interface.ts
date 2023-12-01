import { PoeItem, SageItemGroup } from 'sage-common'
import { IPricedItem } from './priced-item.interface'
import { StashTab } from '../store/domains/stashtab'
import { IStashTabNode } from './stash.interface'
import { SageValuation } from 'echo-common'

export interface ISnapshot {
  uuid: string
  created: number
  stashTabSnapshots: IStashTabSnapshot[]
}

export interface IStashTabSnapshot {
  uuid: string
  stashTabId: string
  value: number
  pricedItems: IPricedItem[]
}

export interface IStashTabItems {
  stashTab: IStashTabNode | string
  items: PoeItem[]
}

export interface IValuatedItem {
  data: PoeItem
  valuation: SageValuation | null | undefined
  group: SageItemGroup | null | undefined
}
