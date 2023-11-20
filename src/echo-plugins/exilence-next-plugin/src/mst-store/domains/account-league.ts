import { Instance, types } from 'mobx-state-tree'
import { CharacterEntry, ICharacterEntry } from './character'
import { StashTabEntry, IStashTabEntry } from './stash-tab'
import { LeagueEntry, ILeagueEntry } from './league'

export interface IAccountLeagueEntry extends Instance<typeof AccountLeagueEntry> {}

export const AccountLeagueEntry = types
  .model('AccountLeagueEntry', {
    uuid: types.identifier,
    league: types.safeReference(LeagueEntry),
    characters: types.optional(types.array(CharacterEntry), []),
    stashTabs: types.optional(types.array(StashTabEntry), [])
  })
  .views((self) => ({}))
  .actions((self) => ({
    // First set all basic C(R)UD functions
    setLeague(league: ILeagueEntry) {
      self.league = league
    },
    addCharacter(character: ICharacterEntry) {
      self.characters.push(character)
    },
    removeCharacter(character: ICharacterEntry) {
      self.characters.remove(character)
    },
    setCharacters(characters: ICharacterEntry[]) {
      self.characters.replace(characters)
    },
    addStashTab(stashtab: IStashTabEntry) {
      self.stashTabs.push(stashtab)
    },
    removeStashTab(stashtab: IStashTabEntry) {
      self.stashTabs.remove(stashtab)
    },
    setStashTabs(stashTabs: IStashTabEntry[]) {
      self.stashTabs.replace(stashTabs)
    }
  }))
