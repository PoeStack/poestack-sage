import React, {PropsWithChildren, useEffect, useState} from "react";
import {StashApi} from "poe-api";
import fs from "fs";


export type EchoContextType = {
    test: () => void;
    plugins: any,
    setSelectedPlugin: any,
    selectedPlugin: any,
    setPlugins: any
}

export const EchoContext = React.createContext<EchoContextType | null>(null);

export const EchoContextProvider: React.FC<PropsWithChildren> = ({children}) => {
    const stashApi = new StashApi()

    const defaultPlugin = {name: "basic", component: BaseComp};
    const [plugins, setPlugins] = useState([defaultPlugin])
    const [selectedPlugin, setSelectedPlugin] = useState(defaultPlugin)

    const value = {
        test: () => {
            stashApi.getStashes("Ancestor").subscribe()
        },
        plugins,
        selectedPlugin,
        setPlugins,
        setSelectedPlugin
    }
    return (<EchoContext.Provider value={value}>{children}</EchoContext.Provider>)
}

export const useEchoContext = () => React.useContext(EchoContext) as EchoContextType;

export function BaseComp () {
    return <>asdas</>
}