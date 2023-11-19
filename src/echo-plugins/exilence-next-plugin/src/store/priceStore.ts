import { action, computed, makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { ILeague } from '../interfaces/league.interface'
import { League } from './domains/league'
import { RootStore } from './rootStore'
import { LeaguePriceDetails } from './domains/league-price-details'

/**
 * TODO: Get prices from stream - Basic implementation
 */
export class PriceStore {
  @observable
  leaguePriceDetails: LeaguePriceDetails[] = []
  @observable isUpdatingPrices: boolean = false

  @observable pollingIntervalMinutes: number = 60
  @observable checkInterval: number = 60 * 1000 * 1

  constructor(private rootStore: RootStore) {
    makeObservable(this)
  }

  @computed get exaltedPrice() {
    const exaltedOrbPrice = this.activePrices?.find((p) => p.name === 'Exalted Orb')
    return exaltedOrbPrice?.calculated
  }

  @computed get divinePrice() {
    const divineOrbPrice = this.activePrices?.find((p) => p.name === 'Divine Orb')
    return divineOrbPrice?.calculated
  }

  @computed get activePrices() {
    const activeLeagueId = this.rootStore.accountStore.activeAccount.activePriceLeague?.id
    const leaguePriceDetails = this.leaguePriceDetails.find((l) => l.leagueId === activeLeagueId)
    const leaguePriceSources = leaguePriceDetails?.leaguePriceSources
    if (!leaguePriceSources || leaguePriceSources?.length === 0) {
      return
    }
    const prices = leaguePriceSources[0]?.prices
    if (!prices || !leaguePriceSources[0]?.pricedFetchedAt) {
      return
    }
    return prices
  }
}
