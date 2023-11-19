import { types } from 'mobx-state-tree'
import { Subject } from 'rxjs'

export const StatusMessage = types.model('StatusMessage', {
  message: types.string,
  translateParam: types.maybe(types.union(types.number, types.string)),
  currentCount: types.maybe(types.number),
  totalCount: types.maybe(types.number)
})

export const UiStateStore = types
  .model('UiStateStore', {
    validated: false,
    isValidating: false,
    isSubmitting: false,
    initiated: false,
    isInitiating: false,
    isSnapshotting: false,
    statusMessage: types.maybe(types.reference(StatusMessage)),
    itemTablePageIndex: 0,
    changingProfile: false
  })
  .volatile((self) => ({
    cancelSnapshot: new Subject<boolean>()
  }))
  .views((self) => ({}))
  .actions((self) => ({}))
