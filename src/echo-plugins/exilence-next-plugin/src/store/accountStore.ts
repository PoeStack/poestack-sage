import { action, autorun, computed, makeObservable, observable, runInAction } from 'mobx'
import { RootStore } from './rootStore'
import { Account } from './domains/account'
import { persist } from 'mobx-persist'

export class AccountStore {
  @persist('list', Account) @observable accounts: Account[] = []
  @persist @observable selectedAccount: string = ''

  constructor(private rootStore: RootStore) {
    makeObservable(this)
  }

  @computed
  get activeAccount(): Account {
    const account = this.accounts.find((a) => a.uuid === this.selectedAccount)
    return account ? account : new Account()
  }

  @action
  setActiveAccount(uuid: string) {
    this.selectedAccount = uuid
  }

  @action
  setActiveAccountByName(name: string) {
    this.selectedAccount = ''
    const account = this.accounts.find((a) => a.name === name)
    if (!account) return
    this.selectedAccount = account!.uuid
  }

  @action
  addOrUpdateAccount(name: string) {
    const foundAccount = this.accounts.find((a) => a.name === name)

    if (foundAccount) {
      return foundAccount
    } else {
      const newAccount = new Account({ name: name })
      this.accounts.push(newAccount)
      return newAccount
    }
  }

  @action
  initSession() {
    // const subscription = POE_ACCOUNT_SERVICE.profile.load('profile').subscribe((poeProfile) => {
    //   if (poeProfile.result?.name) {
    //     const account = this.addOrUpdateAccount(poeProfile.result.name)
    //     this.selectAccountByName(account.name)
    //     subscription.unsubscribe()
    //   }
    // })
  }
}
