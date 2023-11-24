import { computed } from 'mobx'
import { detach, idProp, model, Model, modelAction, rootRef, tProp, types } from 'mobx-keystone'
import { ILeagueNode } from '../../interfaces/league.interface'

@model('nw/league')
export class League extends Model({
  hash: idProp,
  name: tProp(types.string),
  realm: tProp(types.string),
  deleted: tProp(false).withSetter() // Still referenced but does not exist anymore
}) {
  @modelAction
  updateLeague(league: ILeagueNode) {
    this.name = league.name
    this.realm = league.realm
    this.deleted = league.deleted
  }
}
