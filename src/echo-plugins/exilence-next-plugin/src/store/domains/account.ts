import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { persist } from 'mobx-persist'
import { fromStream } from 'mobx-utils'
import { interval, map, of, Subject, takeUntil, throwError, timer } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'
import { AccountLeague } from './account-league'
import { Profile } from './profile'
import { rootStore } from '../..'
import { IAccount } from '../../interfaces/account.interface'

export class Account implements IAccount {
  @persist uuid: string = uuidv4()
  @persist name: string = ''

  @persist @observable activeProfileId: string = ''

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
  get activeLeague() {
    const profile = this.activeProfile
    if (profile) {
      return rootStore.leagueStore.leagues.find((l) => l.id === profile.activeLeagueId)
    } else {
      return undefined
    }
  }

  @computed
  get activeCharacter() {
    const profile = this.activeProfile
    const accountLeague = this.accountLeagues.find((l) => l.leagueId === profile?.activeLeagueId)
    return accountLeague?.characters?.find((ac) => ac.name === profile?.activeCharacterName)
  }

  @computed
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
    // DONE
    const profile = this.activeProfile
    if (profile) {
      return rootStore.leagueStore.priceLeagues.find((l) => l.id === profile.activePriceLeagueId)
    } else {
      return undefined
    }
  }

  @computed
  get activeProfile() {
    return this.profiles.find((p) => p.uuid === this.activeProfileId)
  }

  @action
  setActiveProfile(uuid: string) {
    rootStore.uiStateStore.setChangingProfile(true)
    rootStore.uiStateStore.changeItemTablePage(0)
    this.activeProfileId = uuid
  }

  @action
  queueSnapshot(milliseconds?: number) {
    // fromStream(
    timer(milliseconds ? milliseconds : rootStore.settingStore.autoSnapshotInterval).pipe(
      map(() => {
        if (this.activeProfile && this.activeProfile.readyToSnapshot) {
          this.activeProfile.snapshot()
        } else {
          this.dequeueSnapshot()
          this.queueSnapshot(10 * 1000)
        }
      }),
      takeUntil(this.cancelled)
    )
    // )
  }

  @action
  dequeueSnapshot() {
    this.cancelled.next(true)
  }
}
