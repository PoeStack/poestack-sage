import { types, getEnv, onSnapshot, Instance } from 'mobx-state-tree'
import { AccountStore } from './accountStore'
import { LeagueStore } from './leagueStore'
import { NotificationStore } from './notificationStore'
import { SettingStore } from './settingsStore'
import { UiStateStore } from './uiStateStore'
import { PriceStore } from './priceStore'

export interface IStore extends Instance<typeof Store> {}

export const Store = types
  .model('Store', {
    accountStore: types.optional(AccountStore, {
      accounts: []
    }),
    leagueStore: types.optional(LeagueStore, { leagues: [], priceLeagues: [] }),
    notificationStore: types.optional(NotificationStore, { notifications: [], displayed: [] }),
    settingStore: types.optional(SettingStore, { currency: 'chaos' }),
    uiStateStore: types.optional(UiStateStore, {}),
    priceStore: types.optional(PriceStore, {})
  })
  .views((self) => ({}))
  .actions((self) => ({
    afterAttach() {
      onSnapshot(self, (_snapshot) => {
        console.log('Snapshot Store: ', _snapshot)
      })
    }
  }))
