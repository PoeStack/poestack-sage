import {
  EchoContext,
  EchoDirService,
  EchoPluginService,
  EchoRouter,
  PoeAccountService,
  PoeCharacterService,
  PoeClientLogService,
  PoeStackSettingsService,
  PoeZoneTrackerService,
  PoeStashService,
  SageValuationService,
  SageItemGroupService,
  EchoLoggingService,
  PinoLoggingTarget,
  BrowserIpcLoggingTarget,
  IpcLoggingDelegate
} from 'echo-common'
import { GggApi, GggHttpUtil } from 'ggg-api'
import { ItemGroupingService } from 'sage-common'
import { ACTIVATED_LOG_LEVELS } from '../../constants'

const IPC_LOGGING_DELEGATE: IpcLoggingDelegate = (logLevel, message, payload) => window.api.IPC_LOG({ logLevel, message, payload })

const LOGGING_SERVICE = new EchoLoggingService(new Set(ACTIVATED_LOG_LEVELS))
  .activateLoggingTarget(PinoLoggingTarget.create())
  .activateLoggingTarget(new BrowserIpcLoggingTarget(IPC_LOGGING_DELEGATE))

const ECHO_DIR = new EchoDirService()
const ECHO_PLUGIN_SERVICE = new EchoPluginService(ECHO_DIR, LOGGING_SERVICE, buildContext)
const ECHO_ROUTER = new EchoRouter()

export const GGG_HTTP_UTIL = new GggHttpUtil()
const GGG_API = new GggApi(GGG_HTTP_UTIL)
const POE_ACCOUNT_SERVICE = new PoeAccountService(ECHO_DIR, GGG_API)
const POE_STACK_SETTING_SERVICE = new PoeStackSettingsService(ECHO_DIR)
const POE_CLIENT_LOG_SERVICE = new PoeClientLogService({
  poeStackSettings: POE_STACK_SETTING_SERVICE
})
const SAGE_VALUATION_SERVICE = new SageValuationService(ECHO_DIR, new ItemGroupingService())
const SAGE_ITEM_GROUP_SERVICE = new SageItemGroupService(ECHO_DIR)
const POE_STASH_SERVICE = new PoeStashService(ECHO_DIR, GGG_API)
const POE_CHARCTERS_SERVICE = new PoeCharacterService(ECHO_DIR, GGG_API)
const POE_ZONE_TRACKER_SERVICE = new PoeZoneTrackerService(POE_CLIENT_LOG_SERVICE)

export function buildContext(contextSource: string): EchoContext {
  return {
    source: contextSource,
    dir: ECHO_DIR,
    router: ECHO_ROUTER,
    plugins: ECHO_PLUGIN_SERVICE,
    poeAccounts: POE_ACCOUNT_SERVICE,
    poeClientLog: POE_CLIENT_LOG_SERVICE,
    poeZoneTracker: POE_ZONE_TRACKER_SERVICE,
    poeStackSettings: POE_STACK_SETTING_SERVICE,
    poeStash: POE_STASH_SERVICE,
    poeValuations: SAGE_VALUATION_SERVICE,
    poeCharacters: POE_CHARCTERS_SERVICE,
    itemGroups: SAGE_ITEM_GROUP_SERVICE,
    subscriptions: [],
    loggingService: LOGGING_SERVICE
  }
}

export const APP_CONTEXT = buildContext('echo-app')
