import { Subscription } from 'rxjs'
import { EchoDirService } from './echo-dir-service'
import { EchoPluginService } from './echo-plugin-service'
import { EchoRouter } from './echo-router'
import { PoeAccountService } from './poe-account-service'
import { PoeCharacterService } from './poe-character-service'
import { PoeLogService } from './poe-client-log-service'
import { PoeStashService } from './poe-stash-service'
import { SageValuationService } from './sage-valuation-service'

export type EchoContext = {
  source: string
  dir: EchoDirService
  plugins: EchoPluginService
  router: EchoRouter
  poeAccounts: PoeAccountService
  poeCharacters: PoeCharacterService
  poeLog: PoeLogService
  poeStash: PoeStashService
  poeValuations: SageValuationService,
  subscriptions: Subscription[]
}
