import {STASH_API} from "./echo-context";
import {bind} from "@react-rxjs/core";
import {from, mergeMap, of, toArray} from "rxjs";

export const [useStashTabs, stashTabs$] = bind(
    STASH_API.stashes$, []
)
export const [useStashItems, stashItems$] = bind(
    stashTabs$.pipe(
        mergeMap((tabs) =>
            of(tabs.flatMap((t) => t.children ? t.children : [t])).pipe(
                mergeMap((tabs) => STASH_API.getStashContents("Ancestor", tabs.map((t) => t.id!))),
                mergeMap((e) => from(e.items!)),
                toArray()
            )
        ),
    ), []
)