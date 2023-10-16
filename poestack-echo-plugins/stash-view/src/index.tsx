import React, {useEffect, useState} from 'react';
import {PoeApi} from "poestack-echo-common";
import {bind} from "@react-rxjs/core";

const poeApi = new PoeApi()
const [useStash, xx] = bind(poeApi.currentStash, {})

function StashViewPlugin() {
    useEffect(() => {
        poeApi.loadTab("0d67eb540d")
    }, [])

    const stash = useStash()

    return <div>Stash {JSON.stringify(stash)}</div>
}

export {
    StashViewPlugin
}