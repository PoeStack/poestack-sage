import { types } from 'mobx-state-tree'

export type Currency = 'chaos' | 'divine'
export type CurrencyShort = 'c' | 'd'
export type CurrencyHeader = {
  header: string
  type: CurrencyShort
}

export const CurrencyHeader = types.model('CurrencyHeader', {
  header: types.string,
  type: types.literal<CurrencyShort>('c')
})

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
  .views((self) => ({}))
  .actions((self) => ({}))
