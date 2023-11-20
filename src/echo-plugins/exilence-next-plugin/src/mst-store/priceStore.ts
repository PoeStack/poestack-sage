import { Instance, getParent, types } from 'mobx-state-tree'
import { LeaguePriceDetailsEntry, ILeaguePriceDetailsEntry } from './domains/league-price-details'
import { IStore, Store } from './rootStore'
import { IAccountStore } from './accountStore'

export interface IPriceStore extends Instance<typeof PriceStore> {}

export const PriceStore = types
  .model('PriceStore', {
    leaguePriceDetails: types.optional(types.array(LeaguePriceDetailsEntry), []),
    isUpdatingPrices: false,
    pollingIntervalMinutes: 60,
    checkInterval: 60 * 1000 * 1
  })
  .views((self) => ({
    get exaltedPrice() {
      const exaltedOrbPrice = this.activePrices?.find((p) => p.name === 'Exalted Orb')
      return exaltedOrbPrice?.calculated
    },

    get divinePrice() {
      const divineOrbPrice = this.activePrices?.find((p) => p.name === 'Divine Orb')
      return divineOrbPrice?.calculated
    },

    get activePrices() {
      // No self reference allowed - https://github.com/mobxjs/mobx-state-tree/issues/371
      const accountStore = getParent<IStore>(self).accountStore as IAccountStore
      const activeLeagueId = accountStore.activeAccount?.activeProfile?.activePriceLeague?.id
      const leaguePriceDetails = self.leaguePriceDetails.find(
        (l) => l.league?.id === activeLeagueId
      )
      const leaguePriceSources = leaguePriceDetails?.leaguePriceSources
      if (!leaguePriceSources || leaguePriceSources?.length === 0) {
        return
      }
      const prices = leaguePriceSources[0]?.prices
      if (!prices || !leaguePriceSources[0]?.updated) {
        return
      }
      return prices
    }
  }))
  .actions((self) => ({
    addLeaguePriceDetail(leaguePriceDetail: ILeaguePriceDetailsEntry) {
      self.leaguePriceDetails.push(leaguePriceDetail)
    },
    removeLeaguePriceDetail(leaguePriceDetail: ILeaguePriceDetailsEntry) {
      self.leaguePriceDetails.remove(leaguePriceDetail)
    },
    setLeaguePriceDetails(leaguePriceDetails: ILeaguePriceDetailsEntry[]) {
      self.leaguePriceDetails.replace(leaguePriceDetails)
    }
  }))
