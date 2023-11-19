import { SettingStore } from './settingStore'
import { AccountStore } from './accountStore'
import { LeagueStore } from './leagueStore'
import { UiStateStore } from './uiStateStore'
// import { RouteStore } from './routeStore';
import { PriceStore } from './priceStore'
import { NotificationStore } from './notificationStore'

export class RootStore {
  settingStore: SettingStore
  accountStore: AccountStore
  leagueStore: LeagueStore
  uiStateStore: UiStateStore
  //   routeStore: RouteStore;
  priceStore: PriceStore
  notificationStore: NotificationStore

  constructor() {
    this.settingStore = new SettingStore(this)
    this.accountStore = new AccountStore(this)
    this.leagueStore = new LeagueStore(this)
    this.uiStateStore = new UiStateStore(this)
    // this.routeStore = new RouteStore(this);
    this.priceStore = new PriceStore(this)
    this.notificationStore = new NotificationStore(this)
  }
}
