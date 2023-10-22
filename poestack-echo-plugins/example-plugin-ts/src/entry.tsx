// noinspection JSUnusedGlobalSymbols

import {EchoContextType, RegisteredPlugin} from "poestack-echo-common";
import App from "./App";
import {randomUUID} from "crypto";

const instanceUid = randomUUID()

function start(echoContext: EchoContextType) {
    echoContext.pluginManager.addNavItem({
        pluginInstanceId: instanceUid,
        name: "ExamplePlugin",
        page: App
    })

}

function destroy(echoContext: EchoContextType) {
    echoContext.pluginManager.removeNavItem(instanceUid, "ExamplePlugin")
}

export default function (): RegisteredPlugin {
    return {
        pluginInstanceId: instanceUid,
        start: start,
        destroy: destroy
    }
}