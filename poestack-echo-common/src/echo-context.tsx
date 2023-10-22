import React, {PropsWithChildren, useEffect, useState} from "react";
import {PluginServiceType, usePluginService} from "./plugin-service";
import {StashService, useStashService} from "./stash-service";

export type EchoContextType = {
    stashService: StashService,
    pluginManager: PluginServiceType,
}

export const EchoContext = React.createContext<EchoContextType | null>(null);

export const EchoContextProvider: React.FC<PropsWithChildren> = ({children}) => {
    const pluginManager = usePluginService()

    const stashService = useStashService()

    const value = {
        stashService,
        pluginManager
    }
    return (<EchoContext.Provider value={value}>{children}</EchoContext.Provider>)
}

export const useEchoContext: () => EchoContextType = () => React.useContext(EchoContext) as EchoContextType;