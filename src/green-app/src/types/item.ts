import { SageItemGroup } from 'sage-common'
import { IStashTab } from './echo-api/stash'
import { PoeItem } from './poe-api-models'
import { SageValuation } from './echo-api/valuation'

export type StashItem = {
  stash: IStashTab
  data: PoeItem
}

export type GroupedItem = StashItem & {
  group?: {
    primaryGroup: SageItemGroup
  } | null
}

export type ValuatedItem = GroupedItem & {
  valuation?: SageValuation
}
