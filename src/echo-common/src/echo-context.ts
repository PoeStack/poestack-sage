import { Subscription } from 'rxjs'
import { EchoDirService } from './echo-dir-service'
import { EchoPluginService } from './echo-plugin-service'
import { EchoRouter } from './echo-router'
import { PoeAccountService } from './poe-account-service'
import { PoeCharacterService } from './poe-character-service'
import { PoeClientLogService } from './poe-client-log-service'
import { PoeStashService } from './poe-stash-service'
import { PoeStackSettingsService } from './poe-stack-settings-service'
import { PoeZoneTrackerService } from './poe-zone-tracker-service'
import { SageValuationService } from './sage-valuation-service'
import { SageItemGroupService } from './sage-item-group-service'

export type EchoContext = {
  source: string
  dir: EchoDirService
  plugins: EchoPluginService
  router: EchoRouter
  poeAccounts: PoeAccountService
  poeCharacters: PoeCharacterService
  poeClientLog: PoeClientLogService
  poeStackSettings: PoeStackSettingsService
  poeStash: PoeStashService
  poeZoneTracker: PoeZoneTrackerService
  poeValuations: SageValuationService
  itemGroups: SageItemGroupService
  subscriptions: Subscription[]
}
