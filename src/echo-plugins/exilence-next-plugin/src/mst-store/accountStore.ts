import { Instance, cast, destroy, onSnapshot, types } from 'mobx-state-tree'
import { AccountEntry, IAccountEntry } from './domains/account'
import { v4 as uuidv4 } from 'uuid'

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
    setActiveAccount(account?: IAccountEntry) {
      self.activeAccount = account
    },
    setActiveAccountByName(name: string) {
      self.activeAccount = self.accounts.find((a) => a.name === name)
    },
    addAccount(account: IAccountEntry) {
      self.accounts.push(account)
      self.accountRefs.push(account)
    },
    removeAccount(account: IAccountEntry) {
      self.accounts.remove(account)
      self.accountRefs.remove(account)
    }
  }))
  .actions((self) => ({
    addOrUpdateAccount(name: string) {
      const foundAccount = self.accounts.find((a) => a.name === name)

      if (foundAccount) {
        return foundAccount
      } else {
        const newAccount = AccountEntry.create({ uuid: uuidv4(), name: name })
        self.accounts.push(newAccount)
        return newAccount
      }
    }
  }))
