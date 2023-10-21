import {useEffect, useState} from 'react'
import * as fs from "fs";

import {bind} from "@react-rxjs/core";
import {concatAll, map, mergeMap, take, tap, toArray} from "rxjs";
import {StashApi} from "poe-api";


const poeApi = new StashApi()
const [useStashTabs, stash$] = bind(poeApi.stashTabs$, [])

function App() {
    const stashTabs = useStashTabs()
    useEffect(() => {
        poeApi.load().subscribe()
    }, []);


    return (
        <>
            {JSON.stringify(stashTabs)}
        </>
    )
}

export default App
