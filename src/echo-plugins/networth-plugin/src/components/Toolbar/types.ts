import { Character } from '../../store/domains/character'
import { League } from '../../store/domains/league'
import { StashTab } from '../../store/domains/stashtab'

export type ProfilePayload = {
  name: string
  stashTabs: StashTab[]
  league?: League
  pricingLeague?: League
  character: Character | null
  includeEquipment?: boolean
  includeInventory?: boolean
}
