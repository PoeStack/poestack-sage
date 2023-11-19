import { types, getEnv } from 'mobx-state-tree'
import { AccountStore } from './accountStore'
import { LeagueStore } from './leagueStore'
import { NotificationStore } from './notificationStore'
import { SettingStore } from './settingsStore'
import { UiStateStore } from './uiStateStore'

export const RootStore = types
  .model('RootStore', {
    accountStore: types.optional(AccountStore, {
      accounts: []
    }),
    leagueStore: types.optional(LeagueStore, { leagues: [], priceLeagues: [] }),
    notificationStore: types.optional(NotificationStore, { notifications: [], displayed: [] }),
    settingStore: types.optional(SettingStore, { currency: 'chaos' }),
    uiStateStore: types.optional(UiStateStore, {})
  })
  .views((self) => ({}))
  .actions((self) => ({}))
