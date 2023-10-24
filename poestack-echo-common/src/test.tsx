import {bind} from "@react-rxjs/core";
import {STASH_SERVICE} from "./stash-service";
import {filter, from, map, mergeMap, tap, toArray} from "rxjs";
import {PoeItem, PoePartialStashTab} from "poe-api";

const [useCurrentStashes] = bind(STASH_SERVICE.currentStashes$, [])
const [useCurrentStashesFlat] = bind(
    STASH_SERVICE.currentStashes$
        .pipe(
            map((stashes) => stashes.flatMap((stash) => stash.children ? stash.children : [stash]))
        ),
    []
)

const [useCurrentStashContents] = bind(
    STASH_SERVICE.currentStashContents$,
    []
)

export type PoeStashItemPair = {
    stash: PoePartialStashTab & { items?: PoeItem[] | undefined, loadedAtTimestamp: Date },
    item: PoeItem
}

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
    useCurrentStashes,
    useCurrentStashesFlat,
    useCurrentStashContents,
    useStashItems
}