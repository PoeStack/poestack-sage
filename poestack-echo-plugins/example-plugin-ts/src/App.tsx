import {useEffect, useState} from 'react'
import * as fs from "fs";
import {PoeApi} from "poestack-echo-common";
import {bind} from "@react-rxjs/core";
import {concatAll, map, mergeMap, take, tap, toArray} from "rxjs";


const poeApi = new PoeApi()
const [useStash, stash$] = bind(poeApi.currentStash, {})
const [useItems, item$] = bind(
    poeApi.currentItems.pipe(
        tap((e) => console.log("item", e)),
    ), [])

function App() {
    const items = useItems()
    useEffect(() => {
        poeApi.loadTab("0dcf95da7a")
        poeApi.loadTab("7e4bc38ef3")
    }, []);

    console.log("stash items", items)

    return (
        <>
            {(items as any).map((item) => (
                <img src={item.icon}/>
            ))}
        </>
    )
}

export default App
