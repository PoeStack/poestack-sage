import React, {JSX, useState} from "react";
import {EchoContextType} from "./echo-context";
import {randomUUID} from "crypto";


export type RegisteredPlugin = {
    pluginInstanceId: string,
    start: (c: EchoContextType) => void,
    destroy: (c: EchoContextType) => void
}

export type RegisteredPluginNavItem = {
    pluginInstanceId: string,
    name: string,
    page: React.FC
}

export type PluginServiceType = {
    registeredPlugins: RegisteredPlugin[],
    registerPlugin: (plugin: RegisteredPlugin) => void,
    registeredPluginNavItems: RegisteredPluginNavItem[],
    addNavItem: (item: RegisteredPluginNavItem) => void,
    removeNavItem: (pluginInstanceId: string, name: string) => void,
    selectedNavItem: RegisteredPluginNavItem,
    setSelectedNavItem: (plugin: RegisteredPluginNavItem) => void,
}

export function usePluginService(): PluginServiceType {
    const homeScreenPlugin: RegisteredPlugin = {
        pluginInstanceId: randomUUID(),
        destroy: () => {
        },
        start: () => {
        }
    }
    const homeScreenNavItem = {
        pluginInstanceId: homeScreenPlugin.pluginInstanceId,
        page: BaseComp,
        name: "Home"
    }

    const [registeredPlugins, setRegisteredPlugins] = useState<RegisteredPlugin[]>([homeScreenPlugin])
    const [registeredPluginNavItems, setRegisteredPluginNavItems] = useState<RegisteredPluginNavItem[]>([homeScreenNavItem])
    const [selectedNavItem, setSelectedNavItem] = useState<RegisteredPluginNavItem>(homeScreenNavItem)

    return {
        registeredPlugins,
        registerPlugin: (p) => setRegisteredPlugins([...registeredPlugins, p]),
        addNavItem: (p) => setRegisteredPluginNavItems([...registeredPluginNavItems, p]),
        removeNavItem: (pid, name) => setRegisteredPluginNavItems(registeredPluginNavItems.filter((nav) => nav.pluginInstanceId !== pid && nav.name !== name)),
        registeredPluginNavItems,
        selectedNavItem,
        setSelectedNavItem
    }
}

export function BaseComp() {
    return <>Welcome to PoeStack - Sage</>
}