import {StashApi} from "poe-api";
import {from, mergeMap, of, toArray} from "rxjs";
import {bind} from "@react-rxjs/core";

const stashApi = new StashApi()
const [useStashTabs, stashTabs$] = bind(
    stashApi.stashes$, []
)
const [useStashItems, stashItems$] = bind(
    stashTabs$.pipe(
        mergeMap((tabs) =>
            of(tabs.flatMap((t) => t.children ? t.children : [t])).pipe(
                mergeMap((tabs) => stashApi.getStashContents("Ancestor", tabs.map((t) => t.id!))),
                mergeMap((e) => from(e.items!)),
                toArray()
            )
        ),
    ), []
)

export {
    useStashTabs,
    useStashItems,
    stashApi
}
