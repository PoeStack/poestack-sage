import React, {useState} from "react";

export function usePluginManager() {
    const defaultPlugin = {name: "Home", component: BaseComp};
    const [plugins, setPlugins] = useState([defaultPlugin])
    const [selectedPlugin, setSelectedPlugin] = useState(defaultPlugin)

    return {
        plugins,
        setPlugins,
        selectedPlugin,
        setSelectedPlugin
    }
}

export function BaseComp() {
    return <>Welcome to PoeStack - Sage</>
}