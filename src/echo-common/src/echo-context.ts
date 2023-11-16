import { EchoDirService } from './echo-dir-service'
import { EchoPluginConfigs } from './echo-plugin-config'
import { EchoRouter } from './echo-router'
import { PoeAccountService } from './poe-account-service'
import { PoeCharactersService } from './poe-characters-service'
import { PoeLogService } from './poe-log-service'
import { PoeStashService } from './poe-stash-service'
import { SageValuationService } from './sage-valuation-service'

export type EchoContext = {
  dir: EchoDirService
  pluginService: EchoPluginConfigs
  router: EchoRouter
  poeAccountService: PoeAccountService
  poeCharactersService: PoeCharactersService
  poeLogService: PoeLogService
  poeStashService: PoeStashService
  sageValuationService: SageValuationService
}
