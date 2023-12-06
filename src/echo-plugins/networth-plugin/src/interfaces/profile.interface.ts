export interface IProfile {
  uuid?: string
  name: string
  activeLeagueId: string
  activePriceLeagueId: string
  activeCharacterId?: string
  activeStashTabIds: string[]
  includeEquipment: boolean
  includeInventory: boolean
  incomeResetAt?: number
}
