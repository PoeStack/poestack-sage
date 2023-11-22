import { Instance, types } from 'mobx-state-tree'
import { IMetaData } from '../../interfaces/stash.interface'
import { LeagueEntry, ILeagueEntry } from './league'

export interface IStashTabEntry extends Instance<typeof StashTabEntry> {}

export const StashTabEntry = types
  .model('StashTabEntry', {
    id: types.identifier,
    league: types.safeReference(LeagueEntry),
    name: types.string,
    index: types.number,
    type: types.string,
    parent: types.maybe(types.string),
    folder: types.maybe(types.boolean),
    public: types.maybe(types.boolean),
    metadata: types.frozen<IMetaData>({ colour: '' }),
    deleted: false // Still referenced but does not exist anymore
  })
  .views((self) => ({}))
  .actions((self) => ({
    setDeleted(deleted: boolean) {
      self.deleted = deleted
    },
    updateStashTab(stashTab: IStashTabEntry) {
      Object.assign(self, stashTab)
    },
    setLeague(league: ILeagueEntry) {
      self.league = league
    }
  }))
