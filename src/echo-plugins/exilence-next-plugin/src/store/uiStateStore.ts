import { action, makeObservable, observable } from 'mobx'
import { RootStore } from './rootStore'
import { Subject } from 'rxjs'
import { IStatusMessage } from '../interfaces/status-message.interface'

export class UiStateStore {
  @observable validated: boolean = false
  @observable isValidating: boolean = false
  @observable isSubmitting: boolean = false

  @observable initiated: boolean = false
  @observable isInitiating: boolean = false

  @observable isSnapshotting: boolean = false
  @observable statusMessage: IStatusMessage | undefined = undefined

  @observable itemTablePageIndex: number = 0
  @observable changingProfile: boolean = false

  @observable cancelSnapshot: Subject<boolean> = new Subject()

  constructor(private rootStore: RootStore) {
    makeObservable(this)
  }

  @action
  setCancelSnapshot(cancel: boolean) {
    this.cancelSnapshot.next(cancel)
    if (cancel) {
      this.resetStatusMessage()
      if (this.rootStore.settingStore.autoSnapshotting) {
        this.rootStore.accountStore.activeAccount.dequeueSnapshot()
        this.rootStore.accountStore.activeAccount.queueSnapshot()
      }
      this.setIsSnapshotting(false)
      this.cancelSnapshot.next(!cancel)
    }
  }

  @action
  resetStatusMessage() {
    this.statusMessage = undefined
  }

  @action
  setValidated(validated: boolean) {
    this.validated = validated
  }

  @action
  setValidating(validating: boolean) {
    this.isValidating = validating
  }

  @action
  setSubmitting(submitting: boolean) {
    this.isSubmitting = submitting
  }

  @action
  setInitiated(init: boolean) {
    this.initiated = init
  }

  @action
  setIsInitiating(initiating: boolean) {
    this.isInitiating = initiating
  }

  @action
  setIsSnapshotting(snapshotting: boolean = true) {
    this.isSnapshotting = snapshotting
  }

  @action
  changeItemTablePage(index: number) {
    this.itemTablePageIndex = index
  }

  @action
  setChangingProfile(changing: boolean) {
    this.changingProfile = changing
  }
}
