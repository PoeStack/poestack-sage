import React, {PropsWithChildren} from "react";
import {StashApi} from "poe-api";


export type EchoContextType = {
    test: () => void;
}

export const EchoContext = React.createContext<EchoContextType | null>(null);

export const EchoContextProvider: React.FC<PropsWithChildren> = ({children}) => {
    const stashApi = new StashApi()

    const value = {
        test: () => {
            stashApi.getStashes("Ancestor").subscribe()
        }
    }
    return (<EchoContext.Provider value={value}>{children}</EchoContext.Provider>)
}