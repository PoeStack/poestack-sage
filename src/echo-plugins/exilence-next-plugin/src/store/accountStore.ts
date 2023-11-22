import { Instance, cast, destroy, getParent, onSnapshot, types } from 'mobx-state-tree'
import { AccountEntry, IAccountEntry } from './domains/account'
import { v4 as uuidv4 } from 'uuid'
import { context } from '../entry'
import {
  BehaviorSubject,
  catchError,
  concatMap,
  filter,
  first,
  forkJoin,
  from,
  map,
  merge,
  mergeMap,
  of,
  switchMap,
  throwError
} from 'rxjs'
import { SmartCacheStore } from 'echo-common'
import { PoeProfile } from 'sage-common'
import { filterNullish } from 'ts-ratchet'
import { IStore } from './rootStore'
import externalService from '../service/external.service'
import { LeagueEntry } from './domains/league'
import { getCharacterLeagues } from '../utils/league.utils'
import { toCharacterEntity, toLeagueEntity } from '../utils/entity.utils'
import { ProfileEntry } from './domains/profile'
import { generateProfileName } from '../utils/profile.utils'

export interface IAccountStore extends Instance<typeof AccountStore> {}

type EventType = 'result' | 'error'

export const AccountStore = types
  .model('AccountStore', {
    accounts: types.optional(types.array(AccountEntry), []),
    activeAccount: types.safeReference(AccountEntry)
  })
  .volatile((self) => ({
    profileSubject: BehaviorSubject<{
      [key: string]: SmartCacheStore<PoeProfile>
    }>
  }))
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
    setAccounts(accounts: IAccountEntry[]) {
      self.accounts.replace(accounts)
    },
    addAccount(account: IAccountEntry) {
      self.accounts.push(account)
    },
    removeAccount(account: IAccountEntry) {
      try {
        // destroy(account)
      } catch (error) {
        console.log('Test')
        console.log(error)
      }

      // self.accounts.remove(account)
    },
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
  .actions((self) => ({
    initSession() {
      const { uiStateStore, leagueStore, accountStore } = getParent<IStore>(self)
      uiStateStore.setStatusMessage('initializing_session')
      uiStateStore.setIsInitiating(true)

      externalService
        .getProfile()
        .pipe(
          concatMap((poeProfile) => {
            const account = self.addOrUpdateAccount(poeProfile.name!)
            self.setActiveAccount(account)

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
                      return externalService.getStashTabs(league.id).pipe(
                        map((stashTabs) => {
                          return of(account.updateLeagueStashTabs(stashTabs, league))
                        })
                      )
                    })
                  )
                ]).pipe(
                  concatMap(() => {
                    // Now init and set initial data
                    if (!self.activeAccount?.activeProfile?.isProfileValid) {
                      // Select next valid profile
                      const validProfile = self.activeAccount?.profiles.find(
                        (profile) => profile.isProfileValid
                      )
                      if (validProfile) {
                        self.activeAccount?.setActiveProfile(validProfile)
                        return of({})
                      }

                      // Create valid profle
                      const league = leagueStore.leagues.filter((l) => !l.deleted)[0]
                      const st = self.activeAccount?.stashTabs
                      const stLeagus = st?.filter((st) => {
                        if (st.league?.id === league.id) {
                          return true
                        }
                        return false
                      })
                      const st2Leagues = stLeagus?.slice(0, 2)
                      const stNames = st2Leagues?.map((st) => st.id)

                      const newProfile = ProfileEntry.create({
                        uuid: uuidv4(),
                        name: generateProfileName(),
                        activeLeague: league.uuid,
                        activePriceLeague: leagueStore.priceLeagues.filter((l) => !l.deleted)[0]
                          .uuid,
                        activeStashTabs: stNames
                      })
                      self.activeAccount?.addProfile(newProfile)
                      self.activeAccount?.setActiveProfile(newProfile)

                      const names = self.activeAccount?.activeProfile?.activeStashTabs
                        ?.map((st) => st.id)
                        .join(', ')

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
    },

    initSessionSuccess() {
      const { uiStateStore, notificationStore, settingStore } = getParent<IStore>(self)
      uiStateStore.resetStatusMessage()
      // notificationStore.createNotification('init_session', 'success')
      uiStateStore.setIsInitiating(false)
      uiStateStore.setInitiated(true)

      if (settingStore.autoSnapshotting) {
        self.activeAccount?.queueSnapshot(1)
      }
    },

    initSessionFail(e: Error) {
      const { uiStateStore, notificationStore } = getParent<IStore>(self)
      uiStateStore.resetStatusMessage()
      // notificationStore.createNotification('init_session', 'error', true, e)
      uiStateStore.setIsInitiating(false)
      uiStateStore.setInitiated(true)
      console.error(e) // TODO: Remove
    }
  }))
