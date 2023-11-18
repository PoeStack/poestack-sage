import { EchoDirService } from './echo-dir-service'
import { EchoPluginService } from './echo-plugin-service'
import { EchoRouter } from './echo-router'
import { PoeAccountService } from './poe-account-service'
import { PoeCharactersService } from './poe-characters-service'
import { PoeLogService } from './poe-log-service'
import { PoeStashService } from './poe-stash-service'
import { SageValuationService } from './sage-valuation-service'

export type EchoContext = {
  source: string
  dir: EchoDirService
  plugins: EchoPluginService
  router: EchoRouter
  poeAccounts: PoeAccountService
  poeCharacters: PoeCharactersService
  poeLog: PoeLogService
  poeStash: PoeStashService
  poeValuations: SageValuationService
}
