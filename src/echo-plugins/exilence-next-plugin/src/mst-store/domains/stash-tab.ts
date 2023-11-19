import { types } from 'mobx-state-tree'
import { IMetaData } from '../../interfaces/stash.interface'

export const StashTabEntry = types
  .model('StashTabEntry', {
    uuid: types.identifier,
    id: types.string,
    name: types.string,
    index: types.number,
    type: types.string,
    parent: types.maybe(types.string),
    folder: types.maybe(types.boolean),
    public: types.maybe(types.boolean),
    metadata: types.frozen<IMetaData>({ colour: '' })
  })
  .views((self) => ({}))
  .actions((self) => ({}))
