import { Instance, types } from 'mobx-state-tree'
import { LeagueEntry } from './league'
import { IItem } from '../../interfaces/item.interface'

export interface ICharacterEntry extends Instance<typeof CharacterEntry> {}

export const CharacterEntry = types
  .model('CharacterEntry', {
    uuid: types.identifier,
    id: types.string,
    name: types.string,
    class: types.string,
    level: types.number,
    experience: types.number,
    league: types.safeReference(LeagueEntry),
    expired: types.maybe(types.boolean),
    current: types.maybe(types.boolean),
    deleted: types.maybe(types.boolean),
    inventory: types.frozen<IItem[]>([]),
    equipment: types.frozen<IItem[]>([]),
    jewels: types.frozen<IItem[]>([])
  })
  .views((self) => ({}))
  .actions((self) => ({}))
