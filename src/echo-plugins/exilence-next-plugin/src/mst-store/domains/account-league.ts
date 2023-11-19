import { types } from 'mobx-state-tree'
import { CharacterEntry } from './character'
import { StashTabEntry } from './stash-tab'
import { LeagueEntry } from './league'

export const AccountLeagueEntry = types
  .model('AccountLeagueEntry', {
    uuid: types.identifier,
    league: types.reference(LeagueEntry),
    characters: types.array(CharacterEntry),
    stashTabs: types.array(StashTabEntry)
  })
  .views((self) => ({}))
  .actions((self) => ({}))
