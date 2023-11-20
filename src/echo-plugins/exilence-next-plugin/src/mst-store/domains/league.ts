import { Instance, types } from 'mobx-state-tree'

export interface ILeagueEntry extends Instance<typeof LeagueEntry> {}

export const LeagueEntry = types
  .model('LeagueEntry', {
    // uuid: types.identifier,
    id: types.identifier,
    realm: types.string
  })
  .views((self) => ({}))
  .actions((self) => ({}))
