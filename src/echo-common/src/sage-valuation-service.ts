import { SmartCache } from './smart-cache'
import { HttpUtil, ItemGroupingService, PoeItem, SageItemGroup } from 'sage-common'
import { EchoDirService } from './echo-dir-service'
import { from, map, mergeMap, of } from 'rxjs'
import { validResults } from './smart-cache-hooks'

export class SageValuationService {
  private httpUtil = new HttpUtil()

  constructor(private echoDir: EchoDirService, private itemGroupingService: ItemGroupingService) { }

  public cacheValuationShards = new SmartCache<SageValuationShard>(this.echoDir, "sage-valuations")

  public withValuations(league: string, items: PoeItem[]) {
    return this.itemGroupingService.withGroup(items).pipe(
      mergeMap((e) => this.itemValuation(league, e.data).pipe(
        validResults(),
        map((shard) => ({ ...e, valuation: shard?.valuations?.[e.group?.key ?? ""] }))
      ))
    )
  }

  public itemValuation(league: string, item: PoeItem) {
    const group = this.itemGroupingService.group(item)
    if (group) {
      return this.valuation(league, group)
    }
    return of()
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
