import {useEffect, useState} from 'react'

import {bind} from "@react-rxjs/core";
import {from, map, mergeMap, of, tap, toArray} from "rxjs";
import {StashApi} from "poe-api";


const stashApi = new StashApi()
const [useStashTabs, stashTabs$] = bind(
    stashApi.stashes$, []
)
const [useStashItems, stashItems$] = bind(
    stashTabs$.pipe(
        mergeMap((tabs) =>
            of(tabs.flatMap((t) => t.children ? t.children : [t])).pipe(
                mergeMap((tabs) => stashApi.getStashContents("Ancestor", tabs.map((t) => t.id))),
                mergeMap((e) => from(e.items!)),
                toArray()
            )
        ),
    ), []
)

function App() {
    const stashItems = useStashItems()

    const [search, setSearch] = useState("")


    useEffect(() => {
        stashApi.getStashes("Ancestor").subscribe()
    }, []);


    return (
        <>
            <div>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div>
                    {stashItems
                        .filter((item) => !search.length || item.typeLine.toLowerCase().includes(search.toLowerCase()))
                        .map((item) => (<div>{item.typeLine}</div>))}
                </div>
            </div>
        </>
    )
}

export default App
