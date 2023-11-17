import { GggApi } from 'ggg-api'
import { SmartCache } from './cached-task'
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

export class PoeStashService {
  private groupingService = new ItemGroupingService()
  public currentStashes = new SmartCache<PoePartialStashTab[]>(this.echoDir, (key) =>
    this.gggApi.getStashes(key)
  )
  public currentStashContents = new SmartCache<PoeStashTab>(this.echoDir, (key) =>
    this.gggApi.getStashContent(key.split('_')[0], key.split('_')[1])
  )

  constructor(
    private echoDir: EchoDirService,
    private gggApi: GggApi,
    private valuationApi: SageValuationService
  ) {}

  public stashTabs(league: string): Observable<PoePartialStashTab[]> {
    const result = this.currentStashes.cache$.pipe(
      map((e) => e[league]),
      map((e) => (e?.result ?? []).flatMap((t) => t.children ?? [t]))
    )
    return result
  }

  public stashItems(league: string): Observable<EchoPoeItem[]> {
    const result = this.currentStashContents.cache$.pipe(
      combineLatestWith(this.valuationApi.currentStashes.cache$),
      mergeMap(([tabs, valuationCache]) =>
        from(Object.values(tabs).map((e) => e.result)).pipe(
          filterNullish(),
          filter((e) => e.league === league),
          mergeMap((stash) =>
            (stash?.items ?? []).map((item) => {
              const group = this.groupingService.group(item)

              if (group) {
                const valuationKey = `${group.tag}_${group.shard}_${league}`
                const valuation =
                  valuationCache[valuationKey]?.result?.valuations[group.hash] ?? null
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
  stash: PoePartialStashTab & { items?: PoeItem[] | undefined; loadedAtTimestamp: string }
  data: PoeItem
  group: SageItemGroup | null
  valuation: SageValuation | null
}
