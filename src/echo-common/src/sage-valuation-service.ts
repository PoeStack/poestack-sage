import { SmartCache, SmartCacheEvent } from './smart-cache'
import { HttpUtil, ItemGroupingService, PoeItem, SageItemGroup } from 'sage-common'
import { EchoDirService } from './echo-dir-service'
import { Observable, map, mergeMap, tap } from 'rxjs'
import { validResultsWithNullish } from './smart-cache-hooks'
import { EchoPoeItem } from './poe-stash-service'

export class SageValuationService {
  private httpUtil = new HttpUtil()

  constructor(private echoDir: EchoDirService, private itemGroupingService: ItemGroupingService) { }

  public cacheValuationShards = new SmartCache<SageValuationShard>(this.echoDir, "sage-valuations")

  public withValuations(league: string, items: PoeItem[]): Observable<EchoPoeItem> {
    return this.itemGroupingService.withGroup(items).pipe(
      mergeMap((e) => this.itemValuation(league, e.data).pipe(
        validResultsWithNullish(),
        tap((e) => console.log("shard", e)),
        map((shard) => ({ ...e, valuation: shard?.valuations?.[e.group?.hash ?? ""] }))
      ))
    )
  }

  public itemValuation(league: string, item: PoeItem): Observable<SmartCacheEvent<SageValuationShard>> {
    const group = this.itemGroupingService.group(item)
    if (group) {
      return this.valuation(league, group)
    }
    return SmartCache.emptyResult()
  }

  public valuation(league: string, group: SageItemGroup) {
    const key = `${group.tag}_${group.shard}_${league}`.replaceAll(' ', '_')
    return this.cacheValuationShards
      .load(
        { key: key },
        () => this.loadInternal(key)
      )
  }

  private loadInternal(key: string) {
    return this.httpUtil.get<SageValuationShard>(
      `https://d1tuebvb7o7shd.cloudfront.net/v3/${key}.json`
    )
  }
}

export type SageValuation = {
  l: number
  pvs: number[]
}

export type SageValuationShard = {
  timestampMs: number
  valuations: { [hash: string]: SageValuation }
}
