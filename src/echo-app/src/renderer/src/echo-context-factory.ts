import {
  EchoContext,
  EchoDirService,
  EchoPluginService,
  EchoRouter,
  PoeAccountService,
  PoeCharacterService,
  PoeLogService,
  PoeStashService,
  SageValuationService
} from 'echo-common'
import { GggApi, GggHttpUtil } from 'ggg-api'

const ECHO_DIR = new EchoDirService()
const ECHO_PLUGIN_SERVICE = new EchoPluginService(ECHO_DIR, buildContext)
const ECHO_ROUTER = new EchoRouter()

export const GGG_HTTP_UTIL = new GggHttpUtil()
const GGG_API = new GggApi(GGG_HTTP_UTIL)
const POE_ACCOUNT_SERVICE = new PoeAccountService(ECHO_DIR, GGG_API)
const POE_LOG_SERVICE = new PoeLogService()
const SAGE_VALUATION_SERVICE = new SageValuationService(ECHO_DIR)
const POE_STASH_SERVICE = new PoeStashService(ECHO_DIR, GGG_API, SAGE_VALUATION_SERVICE)
const POE_CHARCTERS_SERVICE = new PoeCharacterService(ECHO_DIR, GGG_API)

export function buildContext(contextSource: string): EchoContext {
  return {
    source: contextSource,
    dir: ECHO_DIR,
    router: ECHO_ROUTER,
    plugins: ECHO_PLUGIN_SERVICE,
    poeAccounts: POE_ACCOUNT_SERVICE,
    poeLog: POE_LOG_SERVICE,
    poeStash: POE_STASH_SERVICE,
    poeValuations: SAGE_VALUATION_SERVICE,
    poeCharacters: POE_CHARCTERS_SERVICE
  }
}

export const APP_CONTEXT = buildContext('echo-app')
