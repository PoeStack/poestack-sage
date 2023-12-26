import { EchoPoeItem, validResults } from "echo-common";
import { bind } from '@react-rxjs/core'
import { BehaviorSubject, debounceTime, from, map, mergeMap, toArray, withLatestFrom } from "rxjs";
import { TFT_CONFIG } from "./tft-config";
import { context } from "../context";

export type TftPoeitem = EchoPoeItem & { totalQuantity: number }

export const TFT_ITEMS = new BehaviorSubject<TftPoeitem[]>([])
export const TFT_FILTERED_ITEMS = new BehaviorSubject<TftPoeitem[]>([])

TFT_CONFIG.pipe(
  debounceTime(1000),
  mergeMap((config) => {
    return from(config.selectedStashes).pipe(
      mergeMap((stash) => context().poeStash.stashTab(config.league, stash?.id!!, { maxAgeMs: 1000 * 60 * 10 })),
      validResults(),
      mergeMap((r) => context().poeValuations.withValuationsResultOnly(config.league, r.items ?? [])),
      map((e) => ({ ...e, stash: null, totalQuantity: 10 })),
      toArray(),
    )
  })

).subscribe(TFT_ITEMS)

TFT_ITEMS.pipe(
  withLatestFrom(TFT_CONFIG),
  map(([items, config]) => {
    const filteredItems = items.filter((e) => {
      return !!e.group && !!e.valuation &&
        config.selectedTftCategory?.tags?.includes(e.group?.primaryGroup?.tag ?? "")
    })
    return filteredItems
  })
).subscribe(TFT_FILTERED_ITEMS)

export const [useTftFilteredItems] = bind(TFT_FILTERED_ITEMS, [])
export const [useTftItems] = bind(TFT_ITEMS, [])

