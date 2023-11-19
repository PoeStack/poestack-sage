import { types } from 'mobx-state-tree'
import { AccountLeagueEntry } from './account-league'
import { ProfileEntry } from './profile'
import { Subject } from 'rxjs'

export const AccountEntry = types
  .model('AccountEntry', {
    uuid: types.identifier,
    name: types.string,
    accountLeagues: types.array(AccountLeagueEntry),
    profiles: types.array(ProfileEntry),
    activeProfile: types.reference(ProfileEntry)
  })
  .volatile((self) => ({
    cancelled: new Subject<boolean>()
  }))
  .views((self) => ({}))
  .actions((self) => ({}))
