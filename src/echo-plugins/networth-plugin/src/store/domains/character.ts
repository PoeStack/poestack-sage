import { computed } from 'mobx'
import {
  clone,
  detach,
  fromSnapshot,
  Frozen,
  frozen,
  idProp,
  model,
  Model,
  modelAction,
  prop,
  rootRef,
  tProp,
  types
} from 'mobx-keystone'
import { IItem } from '../../interfaces/item.interface'
import { League } from './league'
import { ICharacterNode } from '../../interfaces/character.interface'

export const characterLeagueRef = rootRef<League>('nw/characterLeagueRef', {
  onResolvedValueChange(ref, newNode, oldNode) {
    if (oldNode && !newNode) {
      detach(ref)
    }
  }
})

@model('nw/character')
export class Character extends Model({
  id: idProp,
  name: tProp(types.string),
  realm: tProp(types.string),
  class: tProp(types.string),
  leagueRef: tProp(types.ref(characterLeagueRef)).withSetter(),
  level: tProp(types.number),
  experience: tProp(types.number),
  current: tProp(types.maybe(types.boolean)),
  deleted: tProp(false).withSetter(),
  test: prop<string | undefined>(),
  inventory: prop<Frozen<IItem[]> | undefined>().withSetter(),
  equipment: prop<Frozen<IItem[]> | undefined>().withSetter(),
  jewels: prop<Frozen<IItem[]> | undefined>().withSetter()
}) {
  static createPlainCharacter() {}

  @computed
  get league() {
    return this.leagueRef.maybeCurrent
  }

  @modelAction
  updateCharacter(character: ICharacterNode) {
    this.name = character.name
    this.realm = character.realm
    this.class = character.class
    this.leagueRef = character.leagueRef
    this.level = character.level
    this.current = character.current
    this.deleted = character.deleted
    this.inventory = character.inventory
    this.equipment = character.equipment
    this.jewels = character.jewels
  }
}
