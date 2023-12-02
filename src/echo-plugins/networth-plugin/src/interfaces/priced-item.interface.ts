import { SageValuation } from 'echo-common'
import { ICompactTab } from './stash.interface'

export interface IPricedItem {
  uuid: string
  tag: string | undefined
  key: string | undefined
  hash: string | undefined
  itemId: string
  name: string
  typeLine: string
  frameType: number
  identified: boolean
  total: number
  calculated: number
  valuation: SageValuation | undefined
  icon: string
  ilvl: number
  tier: number
  corrupted: boolean
  links: number
  sockets: number
  quality: number
  level: number
  stackSize: number
  totalStacksize: number
  tab: ICompactTab[]
}
