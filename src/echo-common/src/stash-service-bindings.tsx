import {bind} from "@react-rxjs/core";
import {STASH_SERVICE} from "./stash-service";
import {filter, from, map, mergeMap, tap, toArray} from "rxjs";
import {PoeItem, PoePartialStashTab} from "ggg-api";
import {filterNullish} from "ts-ratchet";

export type PoeStashItemPair = {
    stash: PoePartialStashTab & { items?: PoeItem[] | undefined, loadedAtTimestamp: string },
    item: PoeItem
}

export const [useStashes] = bind((league: string) => STASH_SERVICE.currentStashes.cache$
    .pipe(
        map((e) => e[league]),
        map((e) => (e?.result ?? []).flatMap((t) => t.children ?? [t]))
    ), [])

export const [useStashItems] = bind((league: string) => STASH_SERVICE.currentStashContents.cache$
    .pipe(
        mergeMap((tabs) =>
            from(Object.values(tabs).map((e) => e.result)).pipe(
                filterNullish(),
                filter((e) => e.league === league),
                mergeMap((stash) => (stash?.items ?? []).map((item) => ({stash, item}))),
                toArray<PoeStashItemPair>(),
            ))
    ), [])