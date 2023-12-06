import { computed } from 'mobx'
import {
  detach,
  getRoot,
  model,
  Model,
  modelAction,
  prop,
  rootRef,
  tProp,
  types
} from 'mobx-keystone'
import { Account } from './domains/account'
import {
  catchError,
  concatMap,
  forkJoin,
  from,
  map,
  of,
  Subject,
  switchMap,
  takeUntil,
  timer
} from 'rxjs'
import { RootStore } from './rootStore'
import externalService from '../service/external.service'
import { profileLeagueRef, profilePriceLeagueRef, profileStashTabRef } from './domains/profile'
import { Profile } from './domains/profile'
import { generateProfileName } from '../utils/profile.utils'
import { getCharacterLeagues } from '../utils/league.utils'
import { TableView } from './domains/tableView'
import { PersistWrapper } from '../utils/persist.utils'

export const accountStoreAccountRef = rootRef<Account>('nw/accountStoreAccountRef', {
  onResolvedValueChange(ref, newNode, oldNode) {
    if (oldNode && !newNode) {
      detach(ref)
    }
  }
})

@model('nw/accountStore')
export class AccountStore extends Model(
  ...PersistWrapper({
    accounts: tProp(types.array(types.model(Account)), []),
    activeAccountRef: tProp(types.maybe(types.ref(accountStoreAccountRef))).withSetter(),
    version: prop(1)
  })
) {
  cancelledRetry: Subject<boolean> = new Subject()

  @computed
  get activeAccount() {
    // Once the session is initiated, the account is defined. In the meantime skeletons will hide the UI. We will disable all buttons as well
    const account = this.activeAccountRef?.maybeCurrent
    return account
      ? account
      : new Account({ name: 'Unknown', networthTableView: new TableView({}) })
  }

  /**
   * Test
   */
  @modelAction
  setAccounts(accounts: Account[]) {
    this.accounts = accounts
  }

  @modelAction
  addOrUpdateAccount(name: string) {
    const foundAccount = this.accounts.find((a) => a.name === name)

    if (foundAccount) {
      return foundAccount
    } else {
      const newAccount = new Account({
        name,
        networthTableView: new TableView({ id: 'networth-table' })
      })
      this.accounts.push(newAccount)
      return newAccount
    }
  }

  initSession() {
    const { uiStateStore, leagueStore } = getRoot<RootStore>(this)
    if (uiStateStore.isInitiating || uiStateStore.initiated) return

    uiStateStore.setIsInitiating(true)
    uiStateStore.setStatusMessage('initializingSession')

    externalService
      .getProfile()
      .pipe(
        concatMap((poeProfile) => {
          const account = this.addOrUpdateAccount(poeProfile.name!)
          this.setActiveAccountRef(accountStoreAccountRef(account))

          return forkJoin([externalService.getLeagues(), externalService.getCharacters()]).pipe(
            concatMap(([leagues, characters]) => {
              if (leagues.length === 0) {
                throw new Error('noLeaguesFound')
              }
              if (characters.length === 0) {
                throw new Error('noCharactersFound')
              }

              const unsupportedLeagues = ['Path of Exile: Royale']
              const filteredPriceLeagues = leagues.filter(
                (league) =>
                  !unsupportedLeagues.includes(league.id) &&
                  !league.rules!.some((rule) => rule.id === 'NoParties')
              )

              // Update leagues and characters but keep deleted if the profile has a reference -
              leagueStore.updateLeagues(getCharacterLeagues(characters))
              leagueStore.updatePriceLeagues(filteredPriceLeagues)
              account.updateCharacters(characters)

              // TODO: Deactivate profile, when the league is deleted; Deleted stashtabs => No requests; Deleted character => No requests
              const availableLeagues = leagueStore.leagues.filter((l) => !l.deleted)
              return forkJoin([
                from(availableLeagues).pipe(
                  concatMap((league) => {
                    return externalService.getStashTabs(league.name).pipe(
                      map((stashTabs) => {
                        return of(account.updateLeagueStashTabs(stashTabs, league))
                      })
                    )
                  })
                )
              ]).pipe(
                concatMap(() => {
                  // Now init and set initial data
                  if (!this.activeAccount.activeProfile?.isProfileValid) {
                    // Select next valid profile
                    const validProfile = this.activeAccount.profiles.find(
                      (profile) => profile.isProfileValid
                    )
                    if (validProfile) {
                      this.activeAccount.setActiveProfile(validProfile)
                      return of({})
                    }

                    // Create valid profle
                    const league = leagueStore.leagues.filter((l) => !l.deleted)[0]
                    const stashTabs = this.activeAccount.stashTabs
                      .filter((st) => st.leagueRef.id === league.getRefId())
                      .slice(0, 2)
                      .map((st) => profileStashTabRef(st))
                    console.log('stashTabs: ', stashTabs.map((x) => x.getRefId()).join(', '))

                    const newProfile = new Profile({
                      name: generateProfileName(),
                      activeLeagueRef: profileLeagueRef(league),
                      activePriceLeagueRef: profilePriceLeagueRef(
                        leagueStore.priceLeagues.filter((l) => !l.deleted)[0]
                      ),
                      activeStashTabsRef: stashTabs
                    })
                    this.activeAccount.addProfile(newProfile)
                    this.activeAccount.setActiveProfile(newProfile)

                    uiStateStore.setStatusMessage('createdDefaultProfile', newProfile.name)
                  }
                  return of({})
                })
              )
            })
          )
        }),
        switchMap(() => of(this.initSessionSuccess())),
        catchError((e) => {
          return of(this.initSessionFail(e))
        })
      )
      .subscribe()
  }

  private initSessionSuccess() {
    const { uiStateStore, notificationStore, settingStore } = getRoot<RootStore>(this)
    uiStateStore.resetStatusMessage()
    notificationStore.createNotification('success.initSession')
    uiStateStore.setIsInitiating(false)
    uiStateStore.setInitiated(true)

    if (settingStore.autoSnapshotting) {
      this.activeAccount.queueSnapshot(1)
    }
  }

  private initSessionFail(e: Error) {
    const { uiStateStore, notificationStore } = getRoot<RootStore>(this)

    timer(45 * 1000)
      .pipe(
        switchMap(() => of(this.initSession())),
        takeUntil(this.cancelledRetry)
      )
      .subscribe()

    uiStateStore.resetStatusMessage()
    notificationStore.createNotification('error.initSession', true, e)
    uiStateStore.setIsInitiating(false)
    uiStateStore.setInitiated(false)
  }
}
