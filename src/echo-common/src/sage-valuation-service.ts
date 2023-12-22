import { SmartCache, SmartCacheEvent } from './smart-cache'
import { HttpUtil, ItemGroupingService, PoeItem, SageItemGroup } from 'sage-common'
import { EchoDirService } from './echo-dir-service'
import { Observable, map, mergeMap, tap } from 'rxjs'
import { validResultsWithNullish } from './smart-cache-hooks'
import { EchoPoeItem } from './poe-stash-service'

export class SageValuationService {
  private httpUtil = new HttpUtil()

  constructor(
    private echoDir: EchoDirService,
    private itemGroupingService: ItemGroupingService
  ) {}

  public cacheValuationShards = new SmartCache<SageValuationShard>(this.echoDir, 'sage-valuations')

  public withValuationsResultOnly(league: string, items: PoeItem[]) {
    return this.itemGroupingService.withGroup(items).pipe(
      mergeMap((e) =>
        this.itemValuation(league, e.data).pipe(
          validResultsWithNullish(),
          tap((e) => console.log('shard', e)),
          map((shard) => ({ ...e, valuation: shard?.valuations?.[e.group?.hash ?? ''] }))
        )
      )
    )
  }

  public withValuations(league: string, items: PoeItem[]) {
    return this.itemGroupingService.withGroup(items).pipe(
      mergeMap((e) =>
        this.itemValuation(league, e.data).pipe(
          map((vEvent) => {
            if (vEvent.type === 'result') {
              const itemValuation = vEvent?.result?.valuations?.[e?.group?.hash ?? '']
              const eItem: EchoPoeItem = {
                valuation: itemValuation,
                ...e
              }
              return { ...vEvent, result: eItem }
            }
            return { ...vEvent, result: e }
          })
        )
      )
    )
  }

  public itemValuation(
    league: string,
    item: PoeItem
  ): Observable<SmartCacheEvent<SageValuationShard>> {
    const group = this.itemGroupingService.group(item)
    if (group) {
      return this.valuation(league, group)
    }
    return SmartCache.emptyResult()
  }

  public valuation(league: string, group: SageItemGroup) {
    const key = `${league}/${group.tag}`.replaceAll(' ', '_').toLowerCase()
    return this.cacheValuationShards.load({ key: key, maxAgeMs: 1000 * 60 * 60 }, () =>
      this.loadInternal(key)
    )
  }

  public valuationRaw(league: string, tag: string) {
    const key = `${league}/${tag}`.replaceAll(' ', '_').toLowerCase()
    return this.cacheValuationShards.load({ key: key, maxAgeMs: 1000 * 60 * 60 }, () =>
      this.loadInternal(key)
    )
  }

  private mapInternalToExternal(internal: SageValuationShardInternal): SageValuationShard {
    const out: SageValuationShard = {
      meta: internal.metadata,
      valuations: {}
    }

    const percentiles = [5, 7, 10, 12, 15, 18, 20, 25, 30, 50]
    Object.entries(internal.valuations).forEach(([key, value]) => {
      const pValues: { [k: number]: number } = {}
      value.c.forEach((e, i) => {
        pValues[percentiles[i]] = e
      })

      out.valuations[key] = {
        listings: value.l,
        primaryValue: pValues[12],
        pValues: pValues,
        history: {
          primaryValueDaily: value.d,
          primaryValueHourly: value.h
        }
      }
    })

    return out
  }

  private loadInternal(key: string) {
    return this.httpUtil
      .get<SageValuationShardInternal>(
        `https://pub-1ac9e2cd6dca4bda9dc260cb6a6f7c90.r2.dev/v10/valuations/${key}.json`
      )
      .pipe(map((e) => this.mapInternalToExternal(e)))
  }
}

export type SageValuationSummaryInternal = {
  k: string
  i: string
}

export type SageValuationInternal = {
  l: number
  c: number[]
  h: number[]
  d: number[]
}

export type SageValuationShardInternal = {
  metadata: SageValuationMetadata
  valuations: { [hash: string]: SageValuationInternal }
}

export type SageValuationMetadata = {
  divChaosValue: number
  timestampMs: number
}

export type SageValuationHistory = {
  primaryValueDaily: number[]
  primaryValueHourly: number[]
}

export type SageValuation = {
  listings: number
  pValues: { [percentile: number]: number }
  primaryValue: number
  history: SageValuationHistory
}

export type SageValuationShard = {
  meta: SageValuationMetadata
  valuations: { [hash: string]: SageValuation }
}
