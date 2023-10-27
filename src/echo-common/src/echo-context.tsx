import React, {PropsWithChildren} from "react";
import {PluginServiceType, usePluginService} from "./plugin-service";
import {STASH_SERVICE, StashService} from "./stash-service";

export type EchoContextType = {
    stashService: StashService,
    pluginManager: PluginServiceType,
}
export const EchoContext = React.createContext<EchoContextType | null>(null);

export const EchoContextProvider: React.FC<PropsWithChildren> = ({children}) => {
    const pluginManager = usePluginService()


    const value = {
        stashService: STASH_SERVICE,
        pluginManager
    }
    return (<EchoContext.Provider value={value}>{children}</EchoContext.Provider>)
}

export const useEchoContext: () => EchoContextType = () => React.useContext(EchoContext) as EchoContextType;