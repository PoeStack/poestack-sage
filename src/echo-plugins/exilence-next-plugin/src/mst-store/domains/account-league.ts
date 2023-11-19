import { Instance, types } from 'mobx-state-tree'
import { CharacterEntry } from './character'
import { StashTabEntry } from './stash-tab'
import { LeagueEntry } from './league'

export interface IAccountLeagueEntry extends Instance<typeof AccountLeagueEntry> {}

export const AccountLeagueEntry = types
  .model('AccountLeagueEntry', {
    uuid: types.identifier,
    league: types.safeReference(LeagueEntry),
    characters: types.optional(types.array(CharacterEntry), []),
    stashTabs: types.optional(types.array(StashTabEntry), [])
  })
  .views((self) => ({}))
  .actions((self) => ({}))
