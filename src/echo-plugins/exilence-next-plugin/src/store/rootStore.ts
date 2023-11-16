import { AccountStore } from './accountStore'
// import { LeagueStore } from './leagueStore';
// import { NotificationStore } from './notificationStore';
// import { OverlayStore } from './overlayStore';
// import { PriceStore } from './priceStore';
// import { RouteStore } from './routeStore';
// import { SettingStore } from './settingStore';
// import { UiStateStore } from './uiStateStore';

export class RootStore {
  accountStore: AccountStore
  //   uiStateStore: UiStateStore;
  //   settingStore: SettingStore;
  //   routeStore: RouteStore;
  //   leagueStore: LeagueStore;
  //   notificationStore: NotificationStore;
  //   priceStore: PriceStore;
  //   overlayStore: OverlayStore;

  constructor() {
    // this.uiStateStore = new UiStateStore(this);
    this.accountStore = new AccountStore(this)
    // this.settingStore = new SettingStore(this);
    // this.routeStore = new RouteStore(this);
    // this.leagueStore = new LeagueStore(this);
    // this.notificationStore = new NotificationStore(this);
    // this.priceStore = new PriceStore(this);
    // this.overlayStore = new OverlayStore(this);
  }
}
