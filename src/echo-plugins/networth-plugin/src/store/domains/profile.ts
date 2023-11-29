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
      uiStateStore.validated &&
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
}
