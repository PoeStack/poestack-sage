import { computed } from 'mobx'
import { model, Model, tProp, types } from 'mobx-keystone'
import { AccountStore } from './accountStore'
import { LeagueStore } from './leagueStore'
import { NotificationStore } from './notificationStore'
import { SettingStore } from './settingStore'
import { UiStateStore } from './uiStateStore'
import { PriceStore } from './priceStore'

@model('nw/rootStore')
export class RootStore extends Model({
  accountStore: tProp(types.model(AccountStore), new AccountStore({})),
  leagueStore: tProp(types.model(LeagueStore), new LeagueStore({})),
  notificationStore: tProp(types.model(NotificationStore), new NotificationStore({})),
  settingStore: tProp(types.model(SettingStore), new SettingStore({})),
  uiStateStore: tProp(types.model(UiStateStore), new UiStateStore({})),
  priceStore: tProp(types.model(PriceStore), new PriceStore({}))
}) {}
