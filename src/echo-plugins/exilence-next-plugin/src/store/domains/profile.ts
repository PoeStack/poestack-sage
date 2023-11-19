import { computed, makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { v4 as uuidv4 } from 'uuid'
import { ISnapshot } from '../../interfaces/snapshot.interface'
import dayjs from 'dayjs'
import { IProfile } from '../../interfaces/profile.interface'
import { rootStore } from '../..'

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

  @computed
  get hasPricesForActiveLeague() {
    const activePriceDetails = rootStore.priceStore.leaguePriceDetails.find(
      (l) => l.leagueId === this.activePriceLeagueId
    )
    const leaguePriceSources = activePriceDetails?.leaguePriceSources
    if (!leaguePriceSources || leaguePriceSources?.length === 0) {
      return false
    }
    const prices = leaguePriceSources[0]?.prices
    return prices !== undefined && prices.length > 0
  }

  @computed
  get readyToSnapshot() {
    const account = rootStore.accountStore.activeAccount
    const league = account.accountLeagues.find(
      (al) => account.activeLeague && al.leagueId === account.activeLeague.id
    )

    return (
      league &&
      league.stashtabs.length > 0 &&
      !rootStore.priceStore.isUpdatingPrices &&
      rootStore.uiStateStore.validated &&
      rootStore.uiStateStore.initiated &&
      !rootStore.uiStateStore.isSnapshotting &&
      this.hasPricesForActiveLeague
      // rootStore.rateLimitStore.retryAfter === 0
    )
  }
}
