import { computed } from 'mobx'
import { detach, model, Model, modelAction, prop, rootRef, tProp, types } from 'mobx-keystone'
import { ICurrency } from '../interfaces/currency.interface'

export type Currency = 'chaos' | 'divine'
export type CurrencyShort = 'c' | 'd' | 'div'

@model('nw/currencyHeader')
export class CurrencyHeader extends Model({
  header: tProp(types.string),
  type: prop<CurrencyShort>('c').withSetter()
}) {}

@model('nw/settingStore')
export class SettingStore extends Model({
  lowConfidencePricing: tProp(false),
  autoSnapshotting: tProp(false),
  autoSnapshotInterval: tProp(60 * 20 * 1000), // default to 20 minutes
  priceThreshold: tProp(0),
  totalPriceThreshold: tProp(0),
  /**
   * Percentile:
   * [1, 5, 7, 10, 12, 15, 18, 20, 25, 30, 40, 50, 70, 95, 99]
   */
  pvs: tProp(4),
  currency: prop<Currency>('chaos'),
  currencyHeaders: tProp(types.array(types.model(CurrencyHeader)), [])
}) {
  @computed
  get activeCurrency(): ICurrency {
    switch (this.currency) {
      case 'chaos':
        return { name: 'chaos', short: 'c' }
      case 'divine':
        return { name: 'divine', short: 'div' }
    }
  }
}
