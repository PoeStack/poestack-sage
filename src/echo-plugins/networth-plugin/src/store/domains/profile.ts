import { computed } from 'mobx'
import {
  detach,
  getRoot,
  idProp,
  model,
  Model,
  modelAction,
  rootRef,
  tProp,
  types
} from 'mobx-keystone'
import { League } from './league'
import { StashTab, stashTabLeagueRef } from './stashtab'
import { Snapshot } from './snapshot'
import { RootStore } from '../rootStore'
import { Character } from './character'
import { IProfile } from '../../interfaces/profile.interface'
import externalService from '../../service/external.service'
import {
  catchError,
  concatMap,
  forkJoin,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  takeUntil,
  toArray
} from 'rxjs'
import { IStashTabItems, IStashTabSnapshot } from '../../interfaces/snapshot.interface'
import { IStashTab } from '../../interfaces/stash.interface'
import { table } from 'console'
import { IPricedItem } from '../../interfaces/priced-item.interface'
import { mapMapStashItemToPoeItem as mapMapStashItemsToPoeItems } from '../../utils/item.utils'
import { PoeItem } from 'sage-common'

export const profileLeagueRef = rootRef<League>('nw/profileLeagueRef')
export const profilePriceLeagueRef = rootRef<League>('nw/profilePriceLeagueRef')
export const profileCharacterRef = rootRef<Character>('nw/profileCharacterRef')
export const profileStashTabRef = rootRef<StashTab>('nw/profileStashTabRef', {
  onResolvedValueChange(ref, newNode, oldNode) {
    if (oldNode && !newNode) {
      detach(ref)
    }
  }
})

@model('nw/profile')
export class Profile extends Model({
  uuid: idProp,
  name: tProp(types.string),
  activeLeagueRef: tProp(types.ref(profileLeagueRef)).withSetter(),
  activePriceLeagueRef: tProp(types.ref(profilePriceLeagueRef)).withSetter(),
  activeCharacterRef: tProp(types.maybe(types.ref(profileCharacterRef))).withSetter(),
  activeStashTabsRef: tProp(types.array(types.ref(profileStashTabRef)), []).withSetter(),
  snapshots: tProp(types.array(types.model(Snapshot)), []),
  includeEquipment: tProp(false),
  includeInventory: tProp(false),
  incomeResetAt: tProp(types.maybe(types.number)).withSetter()
}) {
  @computed
  get activeLeague() {
    return this.activeLeagueRef.maybeCurrent
  }
  @computed
  get activePriceLeague() {
    return this.activePriceLeagueRef.maybeCurrent
  }
  @computed
  get activeCharacter() {
    return this.activeCharacterRef?.maybeCurrent
  }
  @computed
  get activeStashTabs() {
    return this.activeStashTabsRef.filter((st) => st.maybeCurrent).map((st) => st.maybeCurrent!)
  }
  @computed
  get isProfileValid() {
    return (
      this.activeLeagueRef.isValid &&
      !this.activeLeague!.deleted &&
      this.activePriceLeagueRef.isValid &&
      !this.activePriceLeague!.deleted &&
      (!this.activeCharacterRef ||
        (this.activeCharacterRef.isValid && !this.activeCharacterRef.current.deleted)) &&
      this.activeStashTabs.every((st) => !st.deleted)
    )
  }
  @computed
  get readyToSnapshot(): boolean {
    const { uiStateStore } = getRoot<RootStore>(this)

    return (
      this.activeStashTabs.length > 0 &&
      // !priceStore.isUpdatingPrices &&
      uiStateStore.initiated &&
      !uiStateStore.isSnapshotting &&
      this.isProfileValid
      // store.rateLimitStore.retryAfter === 0
    )
  }

  @modelAction
  updateProfile(
    profile: Pick<
      Profile,
      | 'name'
      | 'activeCharacterRef'
      | 'activeStashTabsRef'
      | 'activePriceLeagueRef'
      | 'activeLeagueRef'
      | 'includeEquipment'
      | 'includeInventory'
    >
  ) {
    this.name = profile.name
    this.activeCharacterRef = profile.activeCharacterRef
    this.activeStashTabsRef = profile.activeStashTabsRef
    this.includeEquipment = profile.includeEquipment
    this.includeInventory = profile.includeInventory
    this.activeLeagueRef = profile.activeLeagueRef
    this.activePriceLeagueRef = profile.activePriceLeagueRef
  }

  @modelAction
  snapshot() {
    if (this.isProfileValid) return this.notifyInvalidProfile()

    const { uiStateStore } = getRoot<RootStore>(this)
    uiStateStore!.setIsSnapshotting(true)
    this.refreshStashTabs()
  }

  @modelAction
  snapshotSuccess() {
    const { accountStore, uiStateStore, notificationStore, settingStore } = getRoot<RootStore>(this)
    uiStateStore.resetStatusMessage()
    notificationStore.createNotification('snapshot', 'success')
    if (settingStore.autoSnapshotting) {
      accountStore.activeAccount.dequeueSnapshot()
      accountStore.activeAccount.queueSnapshot()
    }
    uiStateStore.setIsSnapshotting(false)
    // uiStateStore.setTimeSinceLastSnapshotLabel(undefined)
    // accountStore.activeAccount.activeProfile!.updateNetWorthOverlay()
  }

  @modelAction
  snapshotFail(e?: Error) {
    const { accountStore, uiStateStore, notificationStore, settingStore } = getRoot<RootStore>(this)
    uiStateStore.resetStatusMessage()
    notificationStore.createNotification('snapshot', 'error', true, e)
    if (settingStore.autoSnapshotting) {
      accountStore.activeAccount.dequeueSnapshot()
      accountStore.activeAccount.queueSnapshot()
    }
    uiStateStore.setIsSnapshotting(false)
  }

  @modelAction
  notifyInvalidProfile() {
    const { accountStore, settingStore, uiStateStore, notificationStore } = getRoot<RootStore>(this)
    uiStateStore.resetStatusMessage()
    notificationStore.createNotification('invalid_profile', 'error', true)
    if (settingStore.autoSnapshotting) {
      accountStore.activeAccount.dequeueSnapshot()
      accountStore.activeAccount.queueSnapshot()
    }
    uiStateStore.setIsSnapshotting(false)
  }

  @modelAction
  refreshStashTabs() {
    const { uiStateStore } = getRoot<RootStore>(this)
    const league = this.activeLeague!

    uiStateStore.setStatusMessage('refreshing_stash_tabs')

    externalService
      .getStashTabs(league.name)
      .pipe(
        mergeMap(() => of(this.refreshStashTabsSuccess(league.name))),
        takeUntil(uiStateStore.cancelSnapshot),
        catchError((e: Error) => of(this.refreshStashTabsFail(e, league.name)))
      )
      .subscribe()
  }

  @modelAction
  refreshStashTabsSuccess(leagueId: string) {
    const { notificationStore } = getRoot<RootStore>(this)
    notificationStore.createNotification(
      'refreshing_stash_tabs',
      'success',
      undefined,
      undefined,
      leagueId
    )
    this.getItems()
  }

  @modelAction
  refreshStashTabsFail(e: Error, leagueId: string) {
    const { notificationStore } = getRoot<RootStore>(this)
    notificationStore.createNotification('refreshing_stash_tabs', 'error', true, e, leagueId)
    this.snapshotFail()
  }

  @modelAction
  getItems() {
    if (this.isProfileValid) return this.notifyInvalidProfile()
    const { accountStore, uiStateStore, notificationStore, settingStore, priceStore } =
      getRoot<RootStore>(this)

    const league = this.activeLeague!
    const selectedStashTabs = this.activeStashTabs!

    if (selectedStashTabs.length === 0) {
      return this.getItemsFail(new Error('no_stash_tabs_selected_for_profile'), league?.name)
    }

    const getMainTabsWithChildren =
      selectedStashTabs.length > 0
        ? from(selectedStashTabs).pipe(
            concatMap((tab) =>
              externalService.getStashTabWithChildren(
                { ...tab, metadata: tab.metadata.data },
                league.name
              )
            ),
            toArray()
          )
        : of([])

    uiStateStore.setStatusMessage('fetching_stash_tab', undefined, 1, selectedStashTabs.length)
    forkJoin([
      getMainTabsWithChildren,
      this.activeCharacter ? externalService.getCharacter(this.activeCharacter.name) : of(null)
    ])
      .pipe(
        switchMap((response) => {
          const combinedTabs = response[0]
          const subTabs = combinedTabs
            .filter((sst) => sst.type !== 'MapStash')
            .filter((sst) => sst.children)
            .flatMap((sst) => sst.children ?? sst)
          if (subTabs.length === 0) {
            response[0] = combinedTabs
            return of(response)
          }
          uiStateStore.setStatusMessage('fetching_subtabs', undefined, 1, subTabs.length)
          const getItemsForSubTabsSource = from(subTabs).pipe(
            concatMap((tab) =>
              externalService.getStashTabWithChildren(tab as IStashTab, league.name, true)
            ),
            toArray()
          )
          return getItemsForSubTabsSource.pipe(
            mergeMap((subTabs) => {
              response[0] = combinedTabs.map((sst) => {
                if (sst.children) {
                  const children = subTabs.filter((st) => st.parent === sst.id)
                  const childItems = children.flatMap((st) => st.items ?? [])
                  sst.items = (sst.items ?? []).concat(childItems)
                }
                return sst
              })
              return of(response)
            })
          )
        }),
        map((result) => {
          const stashTabsWithItems = result[0].map((tab) => {
            let items: PoeItem[] = []
            if (tab.items) {
              if (tab.type === 'MapStash') {
                items = mapMapStashItemsToPoeItems(tab as IStashTab, league.name)
              } else {
                items = tab.items
              }
            }

            return {
              stashTabId: tab.id,
              items: items
            } as IStashTabItems
          })

          const characterWithItems = result[1]
          if (characterWithItems) {
            let includedCharacterItems: PoeItem[] = []
            if (this.includeInventory) {
              if (characterWithItems?.inventory) {
                includedCharacterItems = includedCharacterItems.concat(characterWithItems.inventory)
              }
            }
            if (this.includeEquipment) {
              if (characterWithItems?.equipment) {
                includedCharacterItems = includedCharacterItems.concat(characterWithItems.equipment)
              }
            }
            const characterTab: IStashTabItems = {
              stashTabId: 'Character',
              items: includedCharacterItems
            }
            stashTabsWithItems.push(characterTab)
          }
          return stashTabsWithItems.map((stashTabWithItems) => {
            return from(e.result?.items ?? []).pipe(
              mergeMap((item) => {
                const group = this.groupingService.group(item)
                if (group) {
                  return this.valuationApi.valuation(league, group).pipe(
                    mergeMap((vEvent) => {
                      if (vEvent.type === 'result') {
                        const itemValuation = vEvent?.result?.valuations?.[group.hash]
                        const eItem: EchoPoeItem = {
                          // TODO Investigate
                          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                          stash: e?.result!!,
                          data: item,
                          valuation: itemValuation,
                          group: group
                        }
                        return of({ ...vEvent, result: eItem })
                      }
                      return of(vEvent)
                    })
                  )
                }
                return of(null)
              }),
              filterNullish()
            )

            stashTabWithItems.items = mergeItemStacks(stashTabWithItems.items)
            return stashTabWithItems
          })
        }),
        mergeMap((stashTabsWithItems) => of(this.getItemsSuccess(stashTabsWithItems, league.name))),
        takeUntil(uiStateStore.cancelSnapshot),
        catchError((e: Error) => of(this.getItemsFail(e, league.name)))
      )
      .subscribe()
  }

  @modelAction
  getItemsSuccess(stashTabsWithItems: IStashTabSnapshot[], leagueId: string) {
    // todo: clean up, must be possible to write this in a nicer manner (perhaps a joint function for both error/success?)
    const { notificationStore } = getRoot<RootStore>(this)
    notificationStore.createNotification('get_items', 'success', undefined, undefined, leagueId)
    this.priceItemsForStashTabs(stashTabsWithItems)
  }

  @modelAction
  getItemsFail(e: Error, leagueId: string) {
    const { notificationStore } = getRoot<RootStore>(this)
    notificationStore.createNotification('get_items', 'error', true, e, leagueId)
    this.snapshotFail()
  }

  @modelAction
  priceItemsForStashTabs() {}
}
