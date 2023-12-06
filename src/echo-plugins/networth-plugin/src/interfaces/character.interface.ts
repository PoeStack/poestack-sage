import { Frozen, Ref } from 'mobx-keystone'
import { IItem } from './item.interface'
import { League } from '../store/domains/league'

export interface ICharacter {
  id: string
  name: string
  realm: string
  class: string
  league: string
  level: number
  experience: number
  current: boolean
  deleted: boolean
  inventory?: IItem[]
  equipment?: IItem[]
  jewels?: IItem[]
}

export interface ICharacterNode {
  id: string
  name: string
  realm: string
  class: string
  leagueRef: Ref<League>
  level: number
  experience: number
  current: boolean
  deleted: boolean
  inventory?: Frozen<IItem[]>
  equipment?: Frozen<IItem[]>
  jewels?: Frozen<IItem[]>
}

export interface ICharacterEntity extends ICharacter {}
