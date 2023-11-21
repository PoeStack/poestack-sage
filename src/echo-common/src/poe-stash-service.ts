import { GggApi } from 'ggg-api'
import { SmartCache } from './smart-cache'
import { Observable, combineLatestWith, filter, from, mergeMap, of, tap, toArray } from 'rxjs'
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

  public cacheStashes = new SmartCache<PoePartialStashTab[]>(this.echoDir, "poe-stashes", (key) =>
    this.gggApi.getStashes(key)
  )
  public cacheStashContent = new SmartCache<PoeStashTab>(this.echoDir, "poe-stash-contents", (key) =>
    this.gggApi.getStashContent(key.split('_')[0], key.split('_')[1])
  )

  public usePoeStashItems = bind((league: string) => this.useEchoItemCache(league), [])[0]

  constructor(
    private echoDir: EchoDirService,
    private gggApi: GggApi,
    private valuationApi: SageValuationService
  ) { }

  public useStashes(league: string): SmartCacheHookType<PoePartialStashTab[]> {
    return useCache(this.cacheStashes, { key: league })
  }

  private snapshotStashTab(league: string, tabId: string) {
    return this.cacheStashContent.load({ key: `${league}_${tabId}` }).pipe(
      mergeMap((e) => {
        if (e.type === 'result') {
          return from(e.result?.items ?? []).pipe(
            mergeMap((item) => {
              const group = this.groupingService.group(item)
              if (group) {
                return this.valuationApi.valuation(league, group).pipe(
                  mergeMap((vEvent) => {
                    if (vEvent.type === "result") {
                      const itemValuation = vEvent?.result?.valuations?.[group.hash]
                      return of({ ...vEvent, result: { league, tabId, item: item, valuation: itemValuation, group: group } })
                    }
                    return of(vEvent)
                  })
                )
              }
              return of(null)
            }),
            filterNullish()
          )
        }
        else {
          return of(e)
        }
      })
    )
  }

  public snapshot(league: string, stashes: string[]) {
    return from(stashes).pipe(
      mergeMap((e) => this.snapshotStashTab(league, e)),
      tap((e) => {
        if (e.type === "result") {
          console.log("snapshot result", e.result)
        }
      })
    )
  }

  public useEchoItemCache(league: string): Observable<EchoPoeItem[]> {
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
                  valuationCache[valuationKey]?.lastResultEvent?.result?.valuations[group.hash] ??
                  null
                this.valuationApi.load(group.tag, group.shard, league)
                return { stash, data: item, group, valuation }
              }

              return { stash, data: item, group: group, valuation: null }
            })
          ),
          toArray<EchoPoeItem>(),
        )
      )
    )
    return result
  }
}

export type EchoPoeItem = {
  stash: PoeStashTab
  data: PoeItem
  group: SageItemGroup | null
  valuation: SageValuation | null
}
