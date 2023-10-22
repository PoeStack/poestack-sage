import React, {PropsWithChildren, useEffect, useState} from "react";
import {StashApi} from "poe-api";
import {usePluginManager} from "./plugin-manager";

export type EchoContextType = {
    stashApi: StashApi,
    pluginManager: any,
}

export const STASH_API = new StashApi()

export const EchoContext = React.createContext<EchoContextType | null>(null);

export const EchoContextProvider: React.FC<PropsWithChildren> = ({children}) => {
    const pluginManager = usePluginManager()

    const value = {
        stashApi: STASH_API,
        pluginManager
    }
    return (<EchoContext.Provider value={value}>{children}</EchoContext.Provider>)
}

export const useEchoContext: () => EchoContextType = () => React.useContext(EchoContext) as EchoContextType;