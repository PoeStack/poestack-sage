import { computed } from 'mobx'
import {
  detach,
  idProp,
  model,
  Model,
  modelAction,
  prop,
  rootRef,
  tProp,
  types
} from 'mobx-keystone'
import { ILeagueNode } from '../../interfaces/league.interface'
import { PersistWrapper } from '../../utils/persist.utils'

@model('nw/league')
export class League extends Model(
  ...PersistWrapper({
    hash: idProp,
    name: tProp(types.string),
    realm: tProp(types.string),
    deleted: tProp(false).withSetter(), // Still referenced but does not exist anymore
    version: prop(1)
  })
) {
  @modelAction
  updateLeague(league: ILeagueNode) {
    this.name = league.name
    this.realm = league.realm
    this.deleted = league.deleted
  }
}
