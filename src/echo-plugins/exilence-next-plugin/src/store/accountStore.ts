import { computed } from 'mobx'
import {
  detach,
  getParent,
  getRoot,
  model,
  Model,
  modelAction,
  rootRef,
  tProp,
  types
} from 'mobx-keystone'
import { Account } from './domains/account'
import { catchError, concatMap, forkJoin, from, map, of, switchMap } from 'rxjs'
import { RootStore } from './rootStore'
import externalService from '../service/external.service'
import {
  Profile,
  profileLeagueRef,
  profilePriceLeagueRef,
  profileStashTabRef
} from './domains/profile'
import { generateProfileName } from '../utils/profile.utils'
import { getCharacterLeagues } from '../utils/league.utils'

export const accountStoreAccountRef = rootRef<Account>('nw/accountStoreAccountRef', {
  onResolvedValueChange(ref, newNode, oldNode) {
    if (oldNode && !newNode) {
      detach(ref)
    }
  }
})

@model('nw/accountStore')
export class AccountStore extends Model({
  accounts: tProp(types.array(types.model(Account)), []),
  activeAccountRef: tProp(types.maybe(types.ref(accountStoreAccountRef))).withSetter()
}) {
  @computed
  get activeAccount() {
    return this.activeAccountRef?.maybeCurrent
  }

  /**
   * Test
   */
  @modelAction
  setAccounts(accounts: Account[]) {
    this.accounts = accounts
  }
  /**
   * Test
   */
  @modelAction
  removeAccount(idx: number) {
    this.accounts = this.accounts.splice(idx, 1)
  }

  @modelAction
  addOrUpdateAccount(name: string) {
    const foundAccount = this.accounts.find((a) => a.name === name)

    if (foundAccount) {
      return foundAccount
    } else {
      const newAccount = new Account({ name })
      this.accounts.push(newAccount)
      return newAccount
    }
  }

  initSession() {
    const { uiStateStore, leagueStore, accountStore } = getRoot<RootStore>(this)
    uiStateStore.setStatusMessage('initializing_session')
    uiStateStore.setIsInitiating(true)

    externalService
      .getProfile()
      .pipe(
        concatMap((poeProfile) => {
          const account = this.addOrUpdateAccount(poeProfile.name!)
          this.setActiveAccountRef(accountStoreAccountRef(account))

          return forkJoin([externalService.getLeagues(), externalService.getCharacters()]).pipe(
            concatMap(([leagues, characters]) => {
              if (leagues.length === 0) {
                throw new Error('error:no_leagues')
              }
              if (characters.length === 0) {
                throw new Error('error:no_characters')
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
              const availableLeagues = leagueStore.leagues.filter((l) => !l.deleted).slice(0, 1)
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
                  if (!this.activeAccount?.activeProfile?.isProfileValid) {
                    // Select next valid profile
                    const validProfile = this.activeAccount?.profiles.find(
                      (profile) => profile.isProfileValid
                    )
                    if (validProfile) {
                      this.activeAccount?.setActiveProfile(validProfile)
                      return of({})
                    }

                    // Create valid profle
                    const league = leagueStore.leagues.filter((l) => !l.deleted)[0]
                    const stashTabs = this.activeAccount?.stashTabs
                      .filter((st) => st.leagueRef.id === league.getRefId())
                      .slice(0, 2)
                      .map((st) => profileStashTabRef(st))

                    const newProfile = new Profile({
                      name: generateProfileName(),
                      activeLeagueRef: profileLeagueRef(league),
                      activePriceLeagueRef: profilePriceLeagueRef(
                        leagueStore.priceLeagues.filter((l) => !l.deleted)[0]
                      ),
                      activeStashTabsRef: stashTabs
                    })
                    this.activeAccount?.addProfile(newProfile)
                    this.activeAccount?.setActiveProfile(newProfile)

                    uiStateStore.setStatusMessage('created_default_profile', newProfile.name)
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

  initSessionSuccess() {
    const { uiStateStore, notificationStore, settingStore } = getRoot<RootStore>(this)
    uiStateStore.resetStatusMessage()
    // notificationStore.createNotification('init_session', 'success')
    uiStateStore.setIsInitiating(false)
    uiStateStore.setInitiated(true)

    if (settingStore.autoSnapshotting) {
      this.activeAccount?.queueSnapshot(1)
    }
  }

  initSessionFail(e: Error) {
    const { uiStateStore, notificationStore } = getRoot<RootStore>(this)
    uiStateStore.resetStatusMessage()
    // notificationStore.createNotification('init_session', 'error', true, e)
    uiStateStore.setIsInitiating(false)
    uiStateStore.setInitiated(true)
    console.error(e) // TODO: Remove
  }
}
