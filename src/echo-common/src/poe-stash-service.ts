import { GggApi } from 'ggg-api'
import { SmartCache, SmartCacheEvent } from './smart-cache'
import { Observable, combineLatestWith, filter, from, mergeMap, of, toArray } from 'rxjs'
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

  public cacheStashes = new SmartCache<PoePartialStashTab[]>(this.echoDir, "poe-stashes")
  public cacheStashContent = new SmartCache<PoeStashTab>(this.echoDir, "poe-stash-contents")

  public usePoeStashItems = bind((league: string) => this.useEchoItemCache(league), [])[0]

  constructor(
    private echoDir: EchoDirService,
    private gggApi: GggApi,
    private valuationApi: SageValuationService
  ) { }

  public useStashes(league: string): SmartCacheHookType<PoePartialStashTab[]> {
    return useCache(
      this.cacheStashes,
      { key: league },
      () => this.gggApi.getStashes(league)
    )
  }

  private snapshotStashTab(league: string, stashId: string): Observable<SmartCacheEvent<EchoPoeItem>> {
    return this.cacheStashContent.load(
      { key: `${league}_${stashId}` },
      () => this.gggApi.getStashContent(league, stashId)
    ).pipe(
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
                      const eItem: EchoPoeItem = {
                        stash: e?.result!!,
                        data: item,
                        valuation: itemValuation,
                        group: group
                      }
                      return of({ ...vEvent, result: eItem })
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

  public snapshot(league: string, stashes: string[]): Observable<SmartCacheEvent<EchoPoeItem>> {
    return from(stashes).pipe(
      mergeMap((e) => this.snapshotStashTab(league, e)),
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
                this.valuationApi.valuation(
                  league,
                  group
                ).subscribe()
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
  group: SageItemGroup | null | undefined
  valuation: SageValuation | null | undefined
}
