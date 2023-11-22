import { Instance, types } from 'mobx-state-tree'

export interface ILeagueEntry extends Instance<typeof LeagueEntry> {}

interface ILeagueRule {
  id: string
  name: string
}

export const LeagueEntry = types
  .model('LeagueEntry', {
    uuid: types.identifier,
    id: types.string,
    realm: types.string,
    deleted: false // Still referenced but does not exist anymore
  })
  .views((self) => ({}))
  .actions((self) => ({
    setDeleted(deleted: boolean) {
      self.deleted = deleted
    },
    updateLeague(league: ILeagueEntry) {
      Object.assign(self, { ...league, uuid: self.uuid })
    }
  }))
