import { Instance, types } from 'mobx-state-tree'
import { LeagueEntry } from './league'
import { IItem } from '../../interfaces/item.interface'

export interface ICharacterEntry extends Instance<typeof CharacterEntry> {}

export const CharacterEntry = types
  .model('CharacterEntry', {
    id: types.identifier,
    name: types.string,
    realm: types.string,
    class: types.string,
    league: types.safeReference(LeagueEntry),
    level: types.number,
    experience: types.number,
    current: types.maybe(types.boolean),
    deleted: false, // Still referenced but does not exist anymore
    inventory: types.frozen<IItem[]>([]),
    equipment: types.frozen<IItem[]>([]),
    jewels: types.frozen<IItem[]>([])
  })
  .views((self) => ({}))
  .actions((self) => ({
    setInventory(inventory: IItem[]) {
      self.inventory = inventory
    },
    setEquipment(equipment: IItem[]) {
      self.equipment = equipment
    },
    setJewels(jewels: IItem[]) {
      self.jewels = jewels
    },
    setDeleted(deleted: boolean) {
      self.deleted = deleted
    },
    updateCharacter(character: ICharacterEntry) {
      Object.assign(self, character)
    }
  }))
