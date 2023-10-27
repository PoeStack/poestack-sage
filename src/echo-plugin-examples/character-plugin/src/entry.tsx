// noinspection JSUnusedGlobalSymbols

import {EchoContextType, RegisteredPlugin} from "echo-common";
import App from "./App";
import {ArchiveBoxIcon, UsersIcon} from "@heroicons/react/24/outline";

function start(echoContext: EchoContextType) {
    echoContext.echoRouter.registerRoute({
        plugin: "example-characters",
        path: "main",
        page: App,
        navItems: [
            {location: "l-sidebar-m", icon: UsersIcon}
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