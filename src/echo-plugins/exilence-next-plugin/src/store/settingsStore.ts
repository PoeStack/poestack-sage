import { Instance, getParent, types } from 'mobx-state-tree'
import { IStore } from './rootStore'
import { ICurrency } from '../interfaces/currency.interface'
import { IAccountEntity } from '../interfaces/account.interface'
import { IAccountStore } from './accountStore'

export type Currency = 'chaos' | 'divine'
export type CurrencyShort = 'c' | 'd'
export type CurrencyHeader = {
  header: string
  type: CurrencyShort
}
export interface ICurrencyHeader extends Instance<typeof CurrencyHeader> {}
export interface ISettingStore extends Instance<typeof SettingStore> {}

export const CurrencyHeader = types
  .model('CurrencyHeader', {
    header: types.string,
    type: types.literal<CurrencyShort>('c')
  })
  .views((self) => ({}))
  .actions((self) => ({
    setType(type: CurrencyShort) {
      self.type = type
    }
  }))

export const SettingStore = types
  .model('SettingStore', {
    lowConfidencePricing: false,
    autoSnapshotting: false,
    autoSnapshotInterval: 60 * 20 * 1000, // default to 20 minutes
    priceThreshold: 0,
    totalPriceThreshold: 0,
    currency: types.literal<Currency>('chaos'),
    currencyHeaders: types.array(CurrencyHeader)
  })
  .views((self) => ({
    get activeCurrency(): ICurrency {
      switch (self.currency) {
        case 'chaos':
          return { name: 'chaos', short: 'c' }
        case 'divine':
          return { name: 'divine', short: 'div' }
      }
    }
  }))
  .actions((self) => ({
    setLowConfidencePricing(value: boolean) {
      self.lowConfidencePricing = value
    },
    setAutoSnapshotting(value: boolean) {
      const accountStore = getParent<IStore>(self).accountStore as IAccountStore
      if (!value) {
        accountStore.activeAccount?.dequeueSnapshot()
      } else {
        accountStore.activeAccount?.queueSnapshot()
      }
      self.autoSnapshotting = value
    },

    setAutoSnapshotInterval(value: number) {
      self.autoSnapshotInterval = value * 60 * 1000
      const accountStore = getParent<IStore>(self).accountStore as IAccountStore
      accountStore.activeAccount?.dequeueSnapshot()
      accountStore.activeAccount?.queueSnapshot()
    },

    setPriceThreshold(value: number) {
      self.priceThreshold = value
    },

    setTotalPriceThreshold(value: number) {
      self.totalPriceThreshold = value
    },

    setCurrencyHeaderDisplay(header: string) {
      const foundHeader = self.currencyHeaders.find((h) => h.header === header)
      if (foundHeader) {
        if (foundHeader.type === 'c') {
          foundHeader.setType('d')
        } else {
          foundHeader.setType('c')
        }
      } else {
        self.currencyHeaders.push({ header, type: 'c' })
      }
    }
  }))
