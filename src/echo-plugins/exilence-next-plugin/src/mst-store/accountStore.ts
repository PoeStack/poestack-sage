import { Instance, cast, destroy, onSnapshot, types } from 'mobx-state-tree'
import { AccountEntry, IAccountEntry } from './domains/account'

export interface IAccountStore extends Instance<typeof AccountStore> {}

export const AccountStore = types
  .model('AccountStore', {
    accounts: types.optional(types.array(AccountEntry), []),
    accountRefs: types.optional(
      types.array(types.safeReference(AccountEntry, { acceptsUndefined: false })),
      []
    ),
    activeAccount: types.safeReference(AccountEntry)
  })
  .views((self) => ({}))
  .actions((self) => ({
    afterAttach() {
      onSnapshot(self, (_snapshot) => {
        console.log('Snapshot AccountStore: ', _snapshot)
      })
    },
    setActiveAccount(account: IAccountEntry) {
      self.activeAccount = account
    },
    addAccount(account: IAccountEntry) {
      self.accounts.push(account)
      self.accountRefs.push(account)
    },
    removeAccount(account: IAccountEntry) {
      self.accounts.remove(account)
      self.accountRefs.remove(account)
    },
    removeAll() {
      destroy(self.accounts)
    }
  }))
