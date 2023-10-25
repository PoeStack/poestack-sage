import {bind} from "@react-rxjs/core";
import {STASH_SERVICE} from "./stash-service";
import {filter, from, map, mergeMap, tap, toArray} from "rxjs";
import {PoeItem, PoePartialStashTab} from "poe-api";

export type PoeStashItemPair = {
    stash: PoePartialStashTab & { items?: PoeItem[] | undefined, loadedAtTimestamp: Date },
    item: PoeItem
}

export const [useStashes] = bind((league: string) => STASH_SERVICE.currentStashes$
    .pipe(
        map((e) => e[league] ?? []),
        map((e) => e.flatMap((t) => t.children ?? [t]))
    ), [])

const [useStashItems] = bind((league: string) => STASH_SERVICE.currentStashContents$
    .pipe(
        mergeMap((tabs) =>
            from(tabs).pipe(
                filter((e) => e.league === league),
                mergeMap((stash) => stash.items!.map((item) => ({stash, item}))),
                toArray<PoeStashItemPair>(),
            ))
    ), [])

export {
    useStashItems
}