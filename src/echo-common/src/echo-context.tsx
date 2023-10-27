import React, {PropsWithChildren} from "react";
import {PluginServiceType, usePluginService} from "./plugin-service";
import {STASH_SERVICE, StashService} from "./stash-service";
import {ECHO_ROUTER, EchoRouter} from "./echo-router";
import {GggApi} from "ggg-api";

export type EchoContextType = {
    stashService: StashService,
    pluginManager: PluginServiceType,
    echoRouter: EchoRouter
}
export const EchoContext = React.createContext<EchoContextType | null>(null);

export const GGG_API = new GggApi()

export const EchoContextProvider: React.FC<PropsWithChildren> = ({children}) => {
    const pluginManager = usePluginService()


    const value = {
        stashService: STASH_SERVICE,
        echoRouter: ECHO_ROUTER,
        pluginManager
    }
    return (<EchoContext.Provider value={value}>{children}</EchoContext.Provider>)
}

export const useEchoContext: () => EchoContextType = () => React.useContext(EchoContext) as EchoContextType;
