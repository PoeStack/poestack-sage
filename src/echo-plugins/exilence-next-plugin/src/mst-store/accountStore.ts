import { Instance, cast, destroy, onSnapshot, types } from 'mobx-state-tree'
import { AccountEntry, IAccountEntry } from './domains/account'
import { v4 as uuidv4 } from 'uuid'
import { context } from '../entry'
import {
  BehaviorSubject,
  catchError,
  concatMap,
  filter,
  first,
  map,
  mergeMap,
  of,
  switchMap,
  throwError
} from 'rxjs'
import { SmartCacheStore } from 'echo-common'
import { PoeProfile } from 'sage-common'
import { filterNullish } from 'ts-ratchet'

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
    setActiveAccount(account?: IAccountEntry) {
      self.activeAccount = account
    },
    setActiveAccountByName(name: string) {
      self.activeAccount = self.accounts.find((a) => a.name === name)
    },
    addAccount(account: IAccountEntry) {
      self.accounts.push(account)
    },
    removeAccount(account: IAccountEntry) {
      self.accounts.remove(account)
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
    },
    getPoEProfile() {
      const { poeAccounts } = context()
      return poeAccounts.profile
        .load({ key: 'profile' })
        .pipe(
          filter((e) => e.type === 'result' || e.type === 'error'),
          map((e) => {
            if (e.type === 'result') {
              return e.result
            } else if (e.type === 'error') {
              throw new Error(e.error)
            }
            return undefined
          }),
          filterNullish()
          // catchError
        )
        .subscribe((e) => {
          console.log('Got result: ', e)
        })
      // profile.load({ key }).pipe(first()).subscribe()
      // return profile.memoryCache$.pipe(
      //   filter((value) => !!value[key]),
      //   map((value) => ({...value[key]})),
      //   map(({lastErorrEvent, lastRequestEvent, lastResultEvent}) => {
      //     // How to get one event after the other???
      //     if(lastResultEvent) {
      //       // Can this be an result from a request before?
      //     }
      //   })
      // )
    },
    initSession() {
      const {
        poeAccounts: { poeProfile, profile, poeLeagues, leagues }
      } = context()

      this.getPoEProfile()
        .pipe()
        .subscribe((e) => {
          console.log('Got result: ', e)
        })

      // profile.memoryCache$
      //   .pipe(map((e) => Object.values(e)?.[0]?.lastResultEvent?.result))
      //   .subscribe((profile) => {
      //     if (!profile || !profile.name) return
      //     console.timeEnd('Get profile via request: ')
      //     this.addOrUpdateAccount(profile.name)
      //   })

      // poeProfile()
      //   .pipe(
      //     map((profile) => {
      //       if (!profile || !profile.name) return
      //       console.log('Get poe profile')
      //       this.addOrUpdateAccount(profile.name)
      //     })
      //   )
      //   .subscribe()

      // return cache.load(config)

      // if (value?.lastResultEvent?.key && value?.lastResultEvent?.key !== config.key) {
      //   setValue(subject.getValue()?.[config.key] ?? {})
      // }
      // const subscription = subject
      //   .pipe(
      //     tap((e) => console.log('event', config.key, e)),
      //     map((e) => e[config.key]),
      //     filterNullish()
      //   )
      //   .subscribe((newValue) => {
      //     setValue(newValue)
      //   })

      // if (config.key !== null && config.key !== undefined) {
      //   load().subscribe()
      // }

      // profile.load({ key: "profile" }).pipe(
      //   first(),
      //   map(profile => {
      //     profile. // <--- How to obtains the value from the cache/request
      //   })
      // )

      // profile.memoryCache$.pipe(
      //   map(mem => {

      //   })
      // )

      // context().poeCharacters.cacheCharacterList.load({key: "characterList"})
    }
  }))
