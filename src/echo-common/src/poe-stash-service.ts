import { GggApi } from 'ggg-api'
import { CachedTask } from './cached-task'
import { bind } from '@react-rxjs/core'
import {
  catchError,
  combineLatestWith,
  concatMap,
  filter,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
  toArray
} from 'rxjs'
import { filterNullish } from 'ts-ratchet'
import {
  ItemGroupingService,
  PoeItem,
  PoePartialStashTab,
  PoeStashTab,
  SageItemGroup
} from 'sage-common'
import { SAGE_VALUATION_SERVICE, SageValuation } from './sage-valuation-service'
import { it } from 'node:test'

export class PoeStashService {
  public gggApi: GggApi

  public currentStashes = new CachedTask<PoePartialStashTab[]>((key) => this.gggApi.getStashes(key))
  public currentStashContents = new CachedTask<PoeStashTab>((key) =>
    this.gggApi.getStashContent(key.split('_')[0], key.split('_')[1])
  )

  constructor(stashApi: GggApi) {
    this.gggApi = stashApi
  }
}

export const POE_STASH_SERVICE = new PoeStashService(new GggApi())

export type EchoPoeItem = {
  stash: PoePartialStashTab & { items?: PoeItem[] | undefined; loadedAtTimestamp: string }
  data: PoeItem
  group: SageItemGroup | null
  valuation: SageValuation | null
}

export const [usePoeStashes] = bind(
  (league: string) =>
    POE_STASH_SERVICE.currentStashes.cache$.pipe(
      map((e) => e[league]),
      map((e) => (e?.result ?? []).flatMap((t) => t.children ?? [t]))
    ),
  []
)

const groupingService = new ItemGroupingService()

export const [usePoeStashItems] = bind(
  (league: string) =>
    POE_STASH_SERVICE.currentStashContents.cache$.pipe(
      combineLatestWith(SAGE_VALUATION_SERVICE.currentStashes.cache$),
      mergeMap(([tabs, valuationCache]) =>
        from(Object.values(tabs).map((e) => e.result)).pipe(
          filterNullish(),
          filter((e) => e.league === league),
          mergeMap((stash) =>
            (stash?.items ?? []).map((item) => {
              const group = groupingService.group(item)

              if (group) {
                const valuationKey = `${group.tag}_${group.shard}_${league}`
                const valuation =
                  valuationCache[valuationKey]?.result?.valuations[group.hash] ?? null
                SAGE_VALUATION_SERVICE.load(group.tag, group.shard, league)
                return { stash, data: item, group, valuation }
              }

              return { stash, data: item, group: group, valuation: null }
            })
          ),
          toArray<EchoPoeItem>(),
          tap((e) => console.log('aa', e))
        )
      )
    ),
  []
)
