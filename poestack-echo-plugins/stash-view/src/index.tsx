import {bind} from "@react-rxjs/core";
import {PoeApi} from "poestack-echo-common";
import {useEffect, useState} from "react";


const poeApi = new PoeApi();
const [useCurrentStash, y] = bind(poeApi.currentStash, {})

function StashViewPlugin() {
    console.log("Render")

    useEffect(() => {
        poeApi.loadTab("0d67eb540d")
    }, [])

    const currentStash = useCurrentStash()

    return <div>{JSON.stringify(currentStash)}</div>
}

export {
    StashViewPlugin
}