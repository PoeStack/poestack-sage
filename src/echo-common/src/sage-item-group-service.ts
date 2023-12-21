import { HttpUtil } from 'sage-common'
import { EchoDirService } from './echo-dir-service'
import { SmartCache, SmartCacheLoadConfig } from './smart-cache'
import { useCache } from './smart-cache-hooks'
import { map } from 'rxjs'

export class SageItemGroupService {
  private httpUtil = new HttpUtil()
  public cacheValuationShards = new SmartCache<SageItemGroupSummaryShard>(
    this.echoDir,
    'sage-item-group-summaries'
  )

  constructor(private echoDir: EchoDirService) {}

  public summary(tag: string) {
    return this.cacheValuationShards.load({ key: tag, maxAgeMs: 1000 * 60 * 60 * 4 }, () =>
      this.loadInternal(tag)
    )
  }

  private loadInternal(tag: string) {
    return this.httpUtil
      .get<SageItemGroupSummaryShardInternal>(
        `https://pub-1ac9e2cd6dca4bda9dc260cb6a6f7c90.r2.dev/v10/summaries/${tag
          .replaceAll(' ', '_')
          .toLowerCase()}.json`
      )
      .pipe(map((e) => this.mapInternalToExternal(e)))
  }

  private mapInternalToExternal(
    internal: SageItemGroupSummaryShardInternal
  ): SageItemGroupSummaryShard {
    const out: SageItemGroupSummaryShard = {
      summaries: {}
    }

    Object.entries(internal.summaries).forEach(([k, v]) => {
      out.summaries[k] = {
        key: v.k,
        icon: `https://web.poecdn.com/gen/image/${v.i}`,
        sortProperty: v.v,
        unsafeHashProperties: v.p
      }
    })

    return out
  }

  public useSummary(tag: string, config: SmartCacheLoadConfig = { key: tag }) {
    // TODO Investigate
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCache(this.cacheValuationShards, config, () => this.loadInternal(tag))
  }
}

export type SageItemGroupSummary = {
  key: string
  icon: string
  unsafeHashProperties: { [key: string]: any }
  sortProperty: { [league: string]: number }
}

export type SageItemGroupSummaryShard = {
  summaries: { [itemGroupHashString: string]: SageItemGroupSummary }
}

export type SageItemGroupSummaryInternal = {
  k: string
  i: string
  p: { [key: string]: any }
  v: { [league: string]: number }
}

export type SageItemGroupSummaryShardInternal = {
  summaries: { [itemGroupHashString: string]: SageItemGroupSummaryInternal }
}
