import React, {PropsWithChildren, useEffect, useState} from "react";
import {StashApi} from "poe-api";
import fs from "fs";
import {usePluginManager} from "./plugin-manager";


export type EchoContextType = {
    test: () => void;
    pluginManager: any,
}

export const EchoContext = React.createContext<EchoContextType | null>(null);

export const EchoContextProvider: React.FC<PropsWithChildren> = ({children}) => {
    const stashApi = new StashApi()

    const pluginManager = usePluginManager()

    const value = {
        test: () => {
            stashApi.getStashes("Ancestor").subscribe()
        },
        pluginManager
    }
    return (<EchoContext.Provider value={value}>{children}</EchoContext.Provider>)
}

export const useEchoContext: () => EchoContextType = () => React.useContext(EchoContext) as EchoContextType;