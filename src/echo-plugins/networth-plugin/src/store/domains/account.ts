import {
  detach,
  frozen,
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
import { Character, characterLeagueRef } from './character'
import { StashTab, stashTabLeagueRef } from './stashtab'
import { profileCharacterRef, profileStashTabRef } from './profile'
import { Profile } from './profile'
import { RootStore } from '../rootStore'
import { map, Subject, takeUntil, timer } from 'rxjs'
import { computed } from 'mobx'
import { PoeCharacter, PoePartialStashTab } from 'sage-common'
import { League } from './league'
import objectHash from 'object-hash'
import { createLeagueHash } from '../leagueStore'
import { ICharacterNode } from '../../interfaces/character.interface'
import { IStashTabNode } from '../../interfaces/stash.interface'
import { TableView } from './tableView'

export const accountProfileRef = rootRef<Profile>('nw/accountProfileRef', {
  onResolvedValueChange(ref, newNode, oldNode) {
    if (oldNode && !newNode) {
      detach(ref)
    }
  }
})

@model('nw/account')
export class Account extends Model({
  uuid: idProp,
  name: tProp(types.string),
  characters: tProp(types.array(types.model(Character)), []),
  stashTabs: tProp(types.array(types.model(StashTab)), []),
  profiles: tProp(types.array(types.model(Profile)), []),
  activeProfileRef: tProp(types.maybe(types.ref(accountProfileRef))),
  networthTableView: tProp(types.model(TableView)).withSetter()
}) {
  cancelled = new Subject<boolean>()

  @computed
  get activeProfile() {
    return this.activeProfileRef?.maybeCurrent
  }

  @computed
  get activeLeague() {
    return this.activeProfile?.activeLeague
  }

  @computed
  get activePriceLeague() {
    return this.activeProfile?.activePriceLeague
  }

  @computed
  get activeLeagueCharacters() {
    const activeLeagueId = this.activeProfile?.activeLeagueRef?.id
    if (!activeLeagueId) return
    return this.characters.filter((c) => c.leagueRef?.id === activeLeagueId)
  }

  @computed
  get activeLeagueStashTabs() {
    const activeLeagueId = this.activeProfile?.activeLeagueRef?.id
    if (!activeLeagueId) return
    return this.stashTabs.filter((st) => {
      if (this.activeProfile) st.leagueRef?.id === activeLeagueId
    })
  }

  @modelAction
  addProfile(profile: Profile) {
    console.log('add profile', profile)
    this.profiles.push(profile)
  }

  @modelAction
  deleteProfile(profileId: string) {
    const profileIndex = this.profiles.findIndex((profile) => profile.uuid === profileId)
    console.log('delete', profileIndex)
    if (profileIndex > -1) {
      this.profiles = this.profiles.splice(profileIndex, 1)
    }
  }

  @modelAction
  setActiveProfile(profile: Profile) {
    this.networthTableView.changeItemTablePage(0)
    this.activeProfileRef = accountProfileRef(profile)
  }

  @modelAction
  updateCharacters(activeApiCharacters: PoeCharacter[]) {
    const activeCharacters = activeApiCharacters.map(
      (character): ICharacterNode => ({
        id: character.id!,
        name: character.name!,
        realm: character.realm!,
        class: character.class!,
        level: character.level!,
        experience: character.experience!,
        leagueRef: characterLeagueRef(createLeagueHash(character.league!, character.realm!)),
        current: character.current!,
        deleted: false,
        inventory: frozen(character.inventory || []),
        equipment: frozen(character.equipment || []),
        jewels: frozen(character.jewels || [])
      })
    )

    let i = this.characters.length
    while (i--) {
      const char = this.characters[i]
      const foundChar = activeCharacters.find((x) => char.id === x.id)
      if (foundChar) {
        // Update already existent character
        char.updateCharacter(foundChar)
      } else {
        if (getRefsResolvingTo(char, profileCharacterRef).size === 0) {
          // No profile reference - safe to delete
          console.log('Delete character: ', this.characters[i])
          this.characters.splice(i, 1)
        } else {
          // Mark character as deleted
          console.log('Mark character as deleted: ', this.characters[i])
          char.setDeleted(true)
        }
      }
    }

    // Add new characters
    const newCharacters = activeCharacters.filter(
      (x) => !this.characters.some((y) => y.id === x.id)
    )
    if (newCharacters.length > 0) {
      this.characters.push(...newCharacters.map((char) => new Character(char)))
    }
  }

  @modelAction
  updateLeagueStashTabs(activeApiStashTabs: PoePartialStashTab[], league: League) {
    const activeStashTabs = activeApiStashTabs
      .flatMap((stash) => stash.children || stash) // Remove folder
      .map(
        (stash): IStashTabNode => ({
          hash: objectHash({ id: stash.id!, league: league.hash }),
          id: stash.id!,
          name: stash.name!,
          index: stash.index!,
          type: stash.type!,
          parent: stash.parent,
          folder: stash.folder,
          public: stash.metadata?.public,
          leagueRef: stashTabLeagueRef(league),
          metadata: frozen(stash.metadata!),
          deleted: false
        })
      )

    const leagueStashes = this.stashTabs.filter((stash) => stash.league === league)

    let i = leagueStashes.length
    while (i--) {
      const stash = leagueStashes[i]
      const foundStash = activeStashTabs.find((x) => stash.hash === x.hash)
      if (foundStash) {
        // Update already existent stashtabs
        stash.updateStashTab(foundStash)
      } else {
        const stIdx = this.stashTabs.indexOf(stash)
        if (getRefsResolvingTo(stash, profileStashTabRef).size === 0) {
          // No profile reference - safe to delete
          console.log('Delete stashtab: ', this.stashTabs[stIdx])
          this.stashTabs.splice(stIdx, 1)
        } else {
          // Mark stashtab as deleted
          console.log('Mark stashtab as deleted: ', this.stashTabs[stIdx])
          stash.setDeleted(true)
        }
      }
    }

    // Add new stashtabs
    const newStashTabs = activeStashTabs.filter(
      (x) => !this.stashTabs.some((y) => y.hash === x.hash)
    )
    if (newStashTabs.length > 0) {
      this.stashTabs.push(...newStashTabs.map((x) => new StashTab(x)))
    }
  }

  @modelAction
  queueSnapshot(milliseconds?: number) {
    const store = getRoot<RootStore>(this)
    timer(milliseconds ? milliseconds : store.settingStore.autoSnapshotInterval)
      .pipe(
        map(() => {
          if (this.activeProfile?.readyToSnapshot) {
            // this.activeProfile.snapshot()
          } else {
            this.dequeueSnapshot()
            this.queueSnapshot(10 * 1000)
          }
        }),
        takeUntil(this.cancelled)
      )
      .subscribe()
  }

  @modelAction
  dequeueSnapshot() {
    this.cancelled.next(true)
  }
}
