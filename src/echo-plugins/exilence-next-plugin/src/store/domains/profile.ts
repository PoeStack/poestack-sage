import { makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { v4 as uuidv4 } from 'uuid'
import { ISnapshot } from '../../interfaces/snapshot.interface'
import dayjs from 'dayjs'
import { IProfile } from '../../interfaces/profile.interface'

export class Profile implements IProfile {
  @persist uuid: string = uuidv4()

  @persist name: string = ''
  @persist @observable activeLeagueId: string = ''
  @persist @observable activePriceLeagueId: string = ''
  @persist @observable activeCharacterName: string = ''

  @persist('list') @observable activeStashTabIds: string[] = []
  @persist('list') @observable snapshots: ISnapshot[] = []

  @persist @observable active: boolean = false
  @persist @observable includeEquipment: boolean = false
  @persist @observable includeInventory: boolean = false
  @persist @observable incomeResetAt: number = dayjs.utc().valueOf()

  constructor(obj?: IProfile) {
    makeObservable(this)
    Object.assign(this, obj)
  }
}
