import { computed } from 'mobx'
import {
  clone,
  detach,
  frozen,
  idProp,
  model,
  Model,
  modelAction,
  rootRef,
  tProp,
  types
} from 'mobx-keystone'
import { IMetaData, IStashTabNode } from '../../interfaces/stash.interface'
import { League } from './league'

export const stashTabLeagueRef = rootRef<League>('nw/stashTabLeagueRef', {
  onResolvedValueChange(ref, newNode, oldNode) {
    if (oldNode && !newNode) {
      detach(ref)
    }
  }
})

@model('nw/stashTab')
export class StashTab extends Model({
  hash: idProp, // Id + leagueHash
  id: tProp(types.string),
  leagueRef: tProp(types.ref(stashTabLeagueRef)),
  name: tProp(types.string),
  index: tProp(types.number),
  type: tProp(types.string),
  parent: tProp(types.maybe(types.string)),
  folder: tProp(types.maybe(types.boolean)),
  public: tProp(types.maybe(types.boolean)),
  metadata: tProp(types.frozen(types.unchecked<IMetaData>()), () =>
    frozen<IMetaData>({ colour: '' })
  ),
  deleted: tProp(false).withSetter() // Still referenced but does not exist anymore
}) {
  @computed
  get league() {
    return this.leagueRef.maybeCurrent
  }
  @modelAction
  updateStashTab(stashTab: IStashTabNode) {
    this.id = stashTab.id
    this.leagueRef = stashTab.leagueRef
    this.name = stashTab.name
    this.index = stashTab.index
    this.type = stashTab.type
    this.parent = stashTab.parent
    this.folder = stashTab.folder
    this.public = stashTab.public
    this.metadata = stashTab.metadata
    this.deleted = stashTab.deleted
  }
}
