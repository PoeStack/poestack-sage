import React, {useState} from "react";

export type EchoRoute = {
    plugin: string,
    path: string,
    page: React.FC,
    navItems?: EchoRouterNavItem[] | null
}

export type EchoRouterNavItem = {
    location: "l-sidebar-m" | "l-sidebar-b",
    icon: any,
}

export type EchoRouter = {
    registerRoute: (route: EchoRoute) => void,
    removeRoute: (plugin: string, path: string) => void,

    routes: EchoRoute[],
    current: EchoRoute | null,
    push: (next: { plugin: string, path: string }) => void
}

export function useEchoRouter(): EchoRouter {

    const [routes, setRoutes] = useState<EchoRoute[]>([])
    const [currentRoute, setCurrentRoute] = useState<EchoRoute | null>(null)

    return {
        registerRoute: (route) => {
            setRoutes([...routes, route])
        },
        removeRoute: (plugin, path) => {
        },
        routes: routes,
        current: currentRoute,
        push: (next) => {
            const nextRoute = routes.find((e) => e.plugin === next.plugin && e.path === next.path)
            if (nextRoute) {
                setCurrentRoute(nextRoute)
            }
        }
    }
}