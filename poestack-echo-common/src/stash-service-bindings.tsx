import {bind} from "@react-rxjs/core";
import {STASH_SERVICE} from "./stash-service";
import {filter, from, map, mergeMap, tap, toArray} from "rxjs";
import {PoeItem, PoePartialStashTab} from "poe-api";
import {filterNullish} from "poestack-ts-ratchet";

export type PoeStashItemPair = {
    stash: PoePartialStashTab & { items?: PoeItem[] | undefined, loadedAtTimestamp: Date },
    item: PoeItem
}

export const [useStashes] = bind((league: string) => STASH_SERVICE.currentStashes.dataSubject
    .pipe(
        map((e) => e[league]),
        map((e) => (e?.value ?? []).flatMap((t) => t.children ?? [t]))
    ), [])

export const [useStashItems] = bind((league: string) => STASH_SERVICE.currentStashContents.dataSubject
    .pipe(
        mergeMap((tabs) =>
            from(Object.values(tabs).map((e) => e.value)).pipe(
                filterNullish(),
                filter((e) => e.league === league),
                mergeMap((stash) => stash.items!.map((item) => ({stash, item}))),
                toArray<PoeStashItemPair>(),
            ))
    ), [])