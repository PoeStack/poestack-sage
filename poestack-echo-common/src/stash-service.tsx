import {bind, DefaultedStateObservable} from "@react-rxjs/core";
import {from, mergeMap, of, toArray} from "rxjs";
import {PoeApiItem, PoeApiStashTab, StashApi} from "poe-api";


export type StashService = {
    stashApi: StashApi,
    useStashTabs: () => PoeApiStashTab[],
    stashTabs$: DefaultedStateObservable<PoeApiStashTab[]>,
    useStashItems: () => PoeApiItem[]
    stashItems$: DefaultedStateObservable<PoeApiItem[]>
}

export function useStashService(): StashService {
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

    return {
        stashApi,
        useStashTabs,
        stashTabs$,
        useStashItems,
        stashItems$
    }
}
