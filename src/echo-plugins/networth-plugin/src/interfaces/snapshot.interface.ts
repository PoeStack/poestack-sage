import { PoeItem } from 'sage-common'
import { IPricedItem } from './priced-item.interface'

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
  stashTabId: string
  items: PoeItem[]
}
