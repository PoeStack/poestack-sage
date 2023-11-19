import { ICurrency } from './currency.interface'

export interface IProfile {
  uuid?: string
  name: string
  activeLeagueId?: string
  activePriceLeagueId?: string
  activeCharacterName?: string
  activeStashTabIds?: string[]
  active?: boolean
  includeEquipment?: boolean
  includeInventory?: boolean
  incomeResetAt?: number
}

export interface IProfileEntity extends IProfile {
  snapshotsIds: string[]
}
