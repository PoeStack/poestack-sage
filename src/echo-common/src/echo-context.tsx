import React, {PropsWithChildren} from "react";
import {PluginServiceType, usePluginService} from "./plugin-service";
import {STASH_SERVICE, StashService} from "./stash-service";
import {EchoRouter, useEchoRouter} from "./echo-router";

export type EchoContextType = {
    stashService: StashService,
    pluginManager: PluginServiceType,
    echoRouter: EchoRouter
}
export const EchoContext = React.createContext<EchoContextType | null>(null);

export const EchoContextProvider: React.FC<PropsWithChildren> = ({children}) => {
    const pluginManager = usePluginService()
    const echoRouter = useEchoRouter()

    const value = {
        stashService: STASH_SERVICE,
        echoRouter,
        pluginManager
    }
    return (<EchoContext.Provider value={value}>{children}</EchoContext.Provider>)
}

export const useEchoContext: () => EchoContextType = () => React.useContext(EchoContext) as EchoContextType;