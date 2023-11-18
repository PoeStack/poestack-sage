import { GggApi } from 'ggg-api'
import { SmartCache } from './smart-cache'
import { Observable, combineLatestWith, filter, from, map, mergeMap, tap, toArray } from 'rxjs'
import { filterNullish } from 'ts-ratchet'
import {
  ItemGroupingService,
  PoeItem,
  PoePartialStashTab,
  PoeStashTab,
  SageItemGroup
} from 'sage-common'
import { SageValuation, SageValuationService } from './sage-valuation-service'
import { EchoDirService } from './echo-dir-service'
import { SmartCacheHookType, useCache } from './smart-cache-hooks'
import { bind } from '@react-rxjs/core'

export class PoeStashService {
  private groupingService = new ItemGroupingService()

  public cacheStashes = new SmartCache<PoePartialStashTab[]>(this.echoDir, (key) =>
    this.gggApi.getStashes(key)
  )
  public cacheStashContent = new SmartCache<PoeStashTab>(this.echoDir, (key) =>
    this.gggApi.getStashContent(key.split('_')[0], key.split('_')[1])
  )

  public usePoeStashItems = bind((league: string) => this.stashItems(league), [])[0]

  constructor(
    private echoDir: EchoDirService,
    private gggApi: GggApi,
    private valuationApi: SageValuationService
  ) { }

  public useStashes(league: string): SmartCacheHookType<PoePartialStashTab[]> {
    return useCache(this.cacheStashes, { key: league })
  }

  public stashItems(league: string): Observable<EchoPoeItem[]> {
    const result = this.cacheStashContent.memoryCache$.pipe(
      combineLatestWith(this.valuationApi.cacheValuationShards.memoryCache$),
      mergeMap(([tabs, valuationCache]) =>
        from(Object.values(tabs).map((e) => e.lastResultEvent?.result)).pipe(
          filterNullish(),
          filter((e) => e.league === league),
          mergeMap((stash) =>
            (stash?.items ?? []).map((item) => {
              const group = this.groupingService.group(item)

              if (group) {
                const valuationKey = `${group.tag}_${group.shard}_${league}`
                const valuation =
                  valuationCache[valuationKey]?.lastResultEvent?.result?.valuations[group.hash] ?? null
                this.valuationApi.load(group.tag, group.shard, league)
                return { stash, data: item, group, valuation }
              }

              return { stash, data: item, group: group, valuation: null }
            })
          ),
          toArray<EchoPoeItem>(),
          tap((e) => console.log('aa', e))
        )
      )
    )
    return result
  }
}

export type EchoPoeItem = {
  stash: PoeStashTab,
  data: PoeItem
  group: SageItemGroup | null
  valuation: SageValuation | null
}
