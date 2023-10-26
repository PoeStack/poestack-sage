import React, {useState} from "react";
import {EchoContextType} from "./echo-context";


export type RegisteredPlugin = {
    name: string | null | undefined,
    start: (c: EchoContextType) => void,
    destroy: (c: EchoContextType) => void
}

export type RegisteredPluginNavItem = {
    name: string,
    page: React.FC
}

export type PluginServiceType = {
    registeredPlugins: RegisteredPlugin[],
    registerPlugin: (plugin: RegisteredPlugin) => void,
    registeredPluginNavItems: RegisteredPluginNavItem[],
    addNavItem: (item: RegisteredPluginNavItem) => void,
    removeNavItem: (name: string) => void,
    selectedNavItem: RegisteredPluginNavItem,
    setSelectedNavItem: (plugin: RegisteredPluginNavItem) => void,
}

export function usePluginService(): PluginServiceType {
    const homeScreenPlugin: RegisteredPlugin = {
        name: "home-plugin",
        destroy: () => {
        },
        start: () => {
        }
    }
    const homeScreenNavItem = {
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
        removeNavItem: (name) => setRegisteredPluginNavItems(registeredPluginNavItems.filter((nav) => nav.name !== name)),
        registeredPluginNavItems,
        selectedNavItem,
        setSelectedNavItem
    }
}

export function BaseComp() {
    return <>Welcome to PoeStack - Sage</>
}