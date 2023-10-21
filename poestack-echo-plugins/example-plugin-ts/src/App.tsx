import {useEffect, useState} from 'react'
import * as fs from "fs";

import {bind} from "@react-rxjs/core";
import {concatAll, from, map, mergeMap, of, take, tap, toArray} from "rxjs";
import {StashApi} from "poe-api";


const stashApi = new StashApi()
const [useStashTabs, stashTabs$] = bind(
    stashApi.stashes$, []
)
const [useStashItems, stashItems$] = bind(
    stashTabs$.pipe(
        mergeMap((tabs) => {
            return of(tabs).pipe(
                map((e) => e.flatMap((t) => t.children ? t.children!.map((c) => c.id!) : [t.id!])),
                mergeMap((ids) => stashApi.getStashContents("Ancestor", ids)),
                mergeMap((e) => from(e.items!)),
                tap((e) => console.log("i", e)),
                toArray()
            )
        }),
    ), []
)

function App() {
    const stashItems = useStashItems()
    useEffect(() => {
        stashApi.getStashes("Ancestor").subscribe()
    }, []);


    return (
        <>
            {stashItems.map((item) => (<div>{item.typeLine}</div>))}
        </>
    )
}

export default App
