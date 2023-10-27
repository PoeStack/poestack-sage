// noinspection JSUnusedGlobalSymbols

import {EchoContextType, RegisteredPlugin} from "echo-common";
import App from "./App";
import {ArchiveBoxIcon} from "@heroicons/react/24/outline";

function start(echoContext: EchoContextType) {
    echoContext.echoRouter.registerRoute({
        plugin: "example-stash",
        path: "main",
        page: App,
        navItems: [
            {location: "l-sidebar-m", icon: ArchiveBoxIcon}
        ]
    })
}

function destroy(echoContext: EchoContextType) {
}

export default function (): RegisteredPlugin {
    return {
        name: null,
        start: start,
        destroy: destroy
    }
}