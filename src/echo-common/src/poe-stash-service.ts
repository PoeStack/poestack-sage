import { GggApi } from 'ggg-api'
import { SmartCache, SmartCacheConfig } from './smart-cache'
import { PoeCharacter, PoeItem, PoePartialStashTab, PoeStashTab, SageItemGroup } from 'sage-common'
import { SageValuation } from './sage-valuation-service'
import { EchoDirService } from './echo-dir-service'
import { SmartCacheHookType, useCache } from './smart-cache-hooks'

export class PoeStashService {
  public cacheStashes = new SmartCache<PoePartialStashTab[]>(this.echoDir, 'poe-stashes')
  public cacheStashContent = new SmartCache<PoeStashTab>(this.echoDir, 'poe-stash-contents')

  constructor(
    private echoDir: EchoDirService,
    private gggApi: GggApi
  ) { }

  public stashTab(league: string, stashId: string, config?: SmartCacheConfig) {
    return this.cacheStashContent.load(
      { maxAgeMs: 10_000, maxStaleMs: 5_000, ...config, key: `${league}_${stashId}` },
      () => this.gggApi.getStashContent(league, stashId)
    )
  }

  public stashes(league: string, config?: SmartCacheConfig) {
    return this.cacheStashes.load(
      { maxAgeMs: 10_000, maxStaleMs: 5_000, ...config, key: league },
      () => this.gggApi.getStashes(league)
    )
  }

  public useStashes(league: string): SmartCacheHookType<PoePartialStashTab[]> {
    // TODO Investigate
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCache(this.cacheStashes, { key: league }, () => this.gggApi.getStashes(league))
  }
}

export type EchoPoeItem = {
  data: PoeItem
  character?: PoeCharacter | null | undefined
  stash?: PoeStashTab | null | undefined
  group?: { primaryGroup: SageItemGroup } | null | undefined
  valuation?: SageValuation | null | undefined
}
