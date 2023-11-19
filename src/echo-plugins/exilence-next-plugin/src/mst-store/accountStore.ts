import { types } from 'mobx-state-tree'
import { AccountEntry } from './domains/account'

export const AccountStore = types
  .model('AccountStore', {
    accounts: types.array(AccountEntry),
    activeAccount: types.maybe(types.reference(AccountEntry))
  })
  .views((self) => ({}))
  .actions((self) => ({}))
