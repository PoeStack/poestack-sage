import { action, computed, makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { rootStore } from '..'
import { ICurrency } from '../interfaces/currency.interface'

import { RootStore } from './rootStore'

export type Currency = 'chaos' | 'divine'
export type CurrencyShort = 'c' | 'd'
export type CurrencyHeader = {
  header: string
  type: CurrencyShort
}

export class SettingStore {
  @persist @observable lowConfidencePricing: boolean = false
  @persist @observable autoSnapshotting: boolean = false
  @persist @observable autoSnapshotInterval: number = 60 * 20 * 1000 // default to 20 minutes

  @persist @observable priceThreshold: number = 0
  @persist @observable totalPriceThreshold: number = 0
  @persist @observable currency: Currency = 'chaos'
  @persist('list') @observable currencyHeaders: CurrencyHeader[] = []

  constructor(private rootStore: RootStore) {
    makeObservable(this)
  }

  @computed get activeCurrency(): ICurrency {
    switch (this.currency) {
      case 'chaos':
        return { name: 'chaos', short: 'c' }
      case 'divine':
        return { name: 'divine', short: 'div' }
    }
  }

  @action
  setLowConfidencePricing(value: boolean) {
    this.lowConfidencePricing = value
  }

  @action
  setAutoSnapshotting(value: boolean) {
    if (!value) {
      this.rootStore.accountStore.activeAccount.dequeueSnapshot()
    } else {
      this.rootStore.accountStore.activeAccount.queueSnapshot()
    }
    this.autoSnapshotting = value
  }

  @action
  setAutoSnapshotInterval(value: number) {
    this.autoSnapshotInterval = value * 60 * 1000
    this.rootStore.accountStore.activeAccount.dequeueSnapshot()
    this.rootStore.accountStore.activeAccount.queueSnapshot()
  }

  @action
  setPriceThreshold(value: number) {
    this.priceThreshold = value
  }

  @action
  setTotalPriceThreshold(value: number) {
    this.totalPriceThreshold = value
  }

  @action
  setCurrencyHeaderDisplay(header: string) {
    const foundHeader = this.currencyHeaders.find((h) => h.header === header)
    if (foundHeader) {
      if (foundHeader.type === 'c') {
        foundHeader.type = 'd'
      } else {
        foundHeader.type = 'c'
      }
    } else {
      this.currencyHeaders.push({ header, type: 'c' })
    }
  }
}
