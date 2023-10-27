import React, {useState} from "react";
import {EchoContextType} from "./echo-context";

export type RegisteredPlugin = {
    name: string | null | undefined,
    start: (c: EchoContextType) => void,
    destroy: (c: EchoContextType) => void
}

export type PluginServiceType = {
    registeredPlugins: RegisteredPlugin[],
    registerPlugin: (plugin: RegisteredPlugin) => void,
}

export function usePluginService(): PluginServiceType {
    const [registeredPlugins, setRegisteredPlugins] = useState<RegisteredPlugin[]>([])

    return {
        registeredPlugins,
        registerPlugin: (p) => setRegisteredPlugins([...registeredPlugins, p]),
    }
}