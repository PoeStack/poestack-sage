import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { persist } from 'mobx-persist'
import { fromStream } from 'mobx-utils'
import { of, Subject, throwError, timer } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'
import { AccountLeague } from './account-league'
import { Profile } from './profile'
import { rootStore } from '../..'
import { IAccount } from '../../interfaces/account.interface'

export class Account implements IAccount {
  @persist uuid: string = uuidv4()
  @persist name: string = ''

  @persist('list', AccountLeague)
  @observable
  accountLeagues: AccountLeague[] = []
  @persist('list', Profile) @observable profiles: Profile[] = []

  cancelled: Subject<boolean> = new Subject()

  constructor(obj?: IAccount) {
    makeObservable(this)
    Object.assign(this, obj)
  }

  @computed
  get activeCharacter() {
    const profile = this.activeProfile
    const accountLeague = this.accountLeagues.find((l) => l.leagueId === profile?.activeLeagueId)
    return accountLeague?.characters?.find((ac) => ac.name === profile?.activeCharacterName)
  }

  get characters() {
    const profile = this.activeProfile
    if (profile) {
      return this.accountLeagues.find((l) => l.leagueId === profile.activeLeagueId)?.characters
    } else {
      return undefined
    }
  }

  @computed
  get activePriceLeague() {
    // const profile = this.activeProfile;
    // if (profile) {
    //   return rootStore.leagueStore.priceLeagues.find((l) => l.id === profile.activePriceLeagueId);
    // } else {
    //   return undefined;
    // }
    return
  }

  @computed
  get activeProfile() {
    return this.profiles.find((p) => p.active)
  }
}
