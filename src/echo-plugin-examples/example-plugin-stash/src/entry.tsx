// noinspection JSUnusedGlobalSymbols

import {EchoContextType, RegisteredPlugin} from "echo-common";
import App from "./App";

function start(echoContext: EchoContextType) {
    echoContext.pluginManager.addNavItem({
        name: "Stash",
        page: App
    })
}

function destroy(echoContext: EchoContextType) {
    echoContext.pluginManager.removeNavItem("Stash")
}
export default function (): RegisteredPlugin {
    return {
        name: null,
        start: start,
        destroy: destroy
    }
}