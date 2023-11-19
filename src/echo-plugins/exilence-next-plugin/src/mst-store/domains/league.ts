import { types } from 'mobx-state-tree'

export const LeagueEntry = types
  .model('LeagueEntry', {
    uuid: types.identifier,
    id: types.string,
    realm: types.string
  })
  .views((self) => ({}))
  .actions((self) => ({}))
