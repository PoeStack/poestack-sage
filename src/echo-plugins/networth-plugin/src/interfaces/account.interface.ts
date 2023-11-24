import { Ref } from 'mobx-keystone'
import { Character } from '../store-ks/domains/character'
import { Profile } from '../store-ks/domains/profile'
import { StashTab } from '../store-ks/domains/stashtab'

export interface IAccount {
  uuid: string
  name: string
  // characters: Character[]
  // stashTabs: StashTab[]
  // profiles: Profile[]
  // activeProfileRef: Ref<Profile>
}

export interface IAccountNode {
  uuid: string
  name: string
  characters: Character[]
  stashTabs: StashTab[]
  profiles: Profile[]
  activeProfileRef: Ref<Profile>
}
