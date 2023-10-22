// noinspection JSUnusedGlobalSymbols

import {EchoContextType} from "poestack-echo-common";
import App from "./App";

function start(echoContext: EchoContextType) {
    echoContext.pluginManager.setPlugins([...echoContext.pluginManager.plugins, ...[{
        name: "ExamplePlugin v2",
        component: App
    }]])
}

function destroy(echoContext: EchoContextType) {
}

export default function () {
    return {
        start: start,
        destroy: destroy
    }
}