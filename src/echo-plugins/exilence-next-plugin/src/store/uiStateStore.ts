import {
  detach,
  frozen,
  getParent,
  getRefsResolvingTo,
  getRoot,
  idProp,
  model,
  Model,
  modelAction,
  rootRef,
  tProp,
  types
} from 'mobx-keystone'
import { Subject } from 'rxjs'
import { RootStore } from './rootStore'
import { Account } from './domains/account'
import {
  Profile,
  profileCharacterRef,
  profileLeagueRef,
  profilePriceLeagueRef,
  profileStashTabRef
} from './domains/profile'
import { accountStoreAccountRef } from './accountStore'
import { PoeCharacter, PoePartialStashTab } from 'sage-common'

export const statusMessageRef = rootRef<StatusMessage>('nw/statusMessageRef')
export const safeStatusMessageRef = rootRef<StatusMessage>('nw/safeStatusMessageRef', {
  onResolvedValueChange(ref, newNode, oldNode) {
    if (oldNode && !newNode) {
      detach(ref)
    }
  }
})

@model('nw/statusMessage')
export class StatusMessage extends Model({
  uuid: idProp,
  message: tProp(types.string),
  translateParam: tProp(types.maybe(types.or(types.number, types.string))),
  currentCount: tProp(types.maybe(types.number)),
  totalCount: tProp(types.maybe(types.number))
}) {}

@model('nw/uiStateStore')
export class UiStateStore extends Model({
  validated: tProp(false).withSetter(),
  isValidating: tProp(false).withSetter(),
  isSubmitting: tProp(false).withSetter(),
  initiated: tProp(false).withSetter(),
  isInitiating: tProp(false).withSetter(),
  isSnapshotting: tProp(false).withSetter(),
  statusMessage: tProp(types.maybe(types.model(StatusMessage))),
  itemTablePageIndex: tProp(0),
  changingProfile: tProp(false).withSetter(),
  counter: tProp(0).withSetter()
}) {
  cancelSnapshot = new Subject<boolean>()

  @modelAction
  setCancelSnapshot(cancel: boolean) {
    this.cancelSnapshot.next(cancel)
    if (cancel) {
      this.resetStatusMessage()
      const { accountStore, settingStore } = getRoot<RootStore>(this)
      if (settingStore.autoSnapshotting) {
        accountStore.activeAccount?.dequeueSnapshot()
        accountStore.activeAccount?.queueSnapshot()
      }
      this.setIsSnapshotting(false)
      this.cancelSnapshot.next(!cancel)
    }
  }

  @modelAction
  setStatusMessage(
    message: string,
    translateParam?: string | number,
    currentCount?: number,
    totalCount?: number
  ) {
    this.statusMessage = new StatusMessage({
      message: message,
      translateParam: translateParam,
      currentCount: currentCount,
      totalCount: totalCount
    })
  }

  @modelAction
  incrementStatusMessageCount() {
    if (
      this.statusMessage?.currentCount &&
      this.statusMessage?.totalCount &&
      this.statusMessage?.totalCount > this.statusMessage?.currentCount
    ) {
      this.statusMessage.currentCount++
    }
  }

  @modelAction
  resetStatusMessage() {
    this.statusMessage = undefined
  }

  @modelAction
  changeItemTablePage(index: number) {
    this.itemTablePageIndex = index
  }

  /**
   * Tests
   */
  fillTree() {
    const { accountStore, leagueStore } = getRoot<RootStore>(this)

    // Accounts
    // const account1 = new Account({ uuid: 'Account_1', name: 'Account_1' })
    // const account2 = new Account({ uuid: 'Account_2', name: 'Account_2' })
    const account1 = accountStore.addOrUpdateAccount('Account_1')
    const account2 = accountStore.addOrUpdateAccount('Account_2')
    accountStore.setAccounts([account1, account2])
    accountStore.setActiveAccountRef(accountStoreAccountRef(account1))

    // Leagues
    const league1 = { id: 'Standard', realm: 'pc' }
    const league2 = { id: 'Anchestor', realm: 'pc' }
    leagueStore.updateLeagues([league1, league2])
    leagueStore.updatePriceLeagues([league2, league1])

    // Profile leagues
    const activeLeague1 = profileLeagueRef(leagueStore.leagues[0])
    const activeLeague2 = profileLeagueRef(leagueStore.leagues[1])
    const activePriceLeague1 = profileLeagueRef(leagueStore.priceLeagues[0])
    const activePriceLeague2 = profileLeagueRef(leagueStore.priceLeagues[1])

    // Chars
    const char1: PoeCharacter = {
      id: 'char_1',
      name: 'C3ntraX',
      realm: 'pc',
      class: 'Duellist',
      level: 99,
      league: 'Standard',
      experience: 2_123_456_789,
      current: true
    }
    const char2: PoeCharacter = {
      id: 'char_2',
      name: 'C3ntraXX',
      realm: 'pc',
      class: 'Templar',
      level: 88,
      league: 'Standard',
      experience: 123_456_789,
      current: false
    }
    accountStore.activeAccount?.updateCharacters([char1, char2])
    const activeCharacter1 = profileCharacterRef(accountStore.activeAccount?.characters[0]!)

    // Stashes
    const stash1: PoePartialStashTab = {
      id: 'stash_1',
      name: 'Stash 1',
      index: 1,
      type: 'Currency',
      league: 'Anchestor'
    }
    const stash2: PoePartialStashTab = {
      id: 'stash_2',
      name: 'Stash 2',
      index: 2,
      type: 'Map',
      league: 'Anchestor'
    }
    accountStore.activeAccount?.updateLeagueStashTabs([stash1, stash2], leagueStore.leagues[0])
    const activeStashTabs = [profileStashTabRef(accountStore.activeAccount?.stashTabs[0]!)]

    // Profile
    const profile1 = new Profile({
      activeLeagueRef: activeLeague1,
      activePriceLeagueRef: activePriceLeague1,
      activeCharacterRef: activeCharacter1,
      activeStashTabsRef: activeStashTabs,
      name: 'Profile_1'
    })
    const profile2 = new Profile({
      activeLeagueRef: activeLeague2,
      activePriceLeagueRef: activePriceLeague2,
      name: 'Profile_2'
    })
    accountStore.activeAccount?.addProfile(profile1)
    accountStore.activeAccount?.addProfile(profile2)
    accountStore.activeAccount?.setActiveProfile(profile1)
  }

  /**
   * Tests
   */
  testReferences() {
    const { leagueStore, accountStore } = getRoot<RootStore>(this)
    console.log(getRefsResolvingTo(leagueStore.leagues[0]))
    console.log(getRefsResolvingTo(leagueStore.leagues[1]))
    console.log(getRefsResolvingTo(leagueStore.priceLeagues[0]))
    console.log(getRefsResolvingTo(leagueStore.priceLeagues[1]))
    console.log(getRefsResolvingTo(accountStore.accounts[1]))
  }
}
