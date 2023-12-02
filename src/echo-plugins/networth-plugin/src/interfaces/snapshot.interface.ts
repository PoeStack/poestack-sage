import { PoeItem, SageItemGroup } from 'sage-common'
import { IPricedItem } from './priced-item.interface'
import { IStashTabNode } from './stash.interface'
import { SageValuation } from 'echo-common'
import { Frozen } from 'mobx-keystone'

export interface IStashTabItems {
  stashTab: IStashTabNode | string
  items: PoeItem[]
}

export interface IValuatedItem {
  data: PoeItem
  group: SageItemGroup | null
  valuation: SageValuation | undefined
  timestampMs: number | undefined
}
