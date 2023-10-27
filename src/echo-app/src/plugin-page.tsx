import React, {useEffect, useState} from "react";

import {ECHO_ROUTER, RegisteredPlugin, useEchoContext} from "echo-common";
import fs from "fs";
import * as path from "path";
import {HomeIcon, UserCircleIcon} from "@heroicons/react/24/outline";
import {QuestionMarkCircleIcon} from "@heroicons/react/20/solid";
import {EchoRoute, EchoRouter, EchoRouterNavItem} from "echo-common/dist/cjs/echo-router";
import {bind} from "@react-rxjs/core";
import {ProfilePage} from "./profile-page";

const [useCurrentRoute] = bind(ECHO_ROUTER.currentRoute$)
const [useCurrentRoutes] = bind(ECHO_ROUTER.routes$)

export const PluginPage: React.FC = () => {
    const echoContext = useEchoContext()
    const pluginManager = echoContext.pluginManager
    const echoRouter = echoContext.echoRouter

    const currentRoute = useCurrentRoute()

    const PluginBody = currentRoute?.page ?? DefaultPage

    useEffect(() => {
        const homeRoute: EchoRoute = {
            navItems: [
                {
                    location: "l-sidebar-m",
                    icon: HomeIcon
                }
            ],
            page: DefaultPage,
            path: "home",
            plugin: "sage"
        }
        echoRouter.registerRoute(homeRoute)
        echoRouter.push(homeRoute)

        echoRouter.registerRoute({
                navItems: [
                    {
                        location: "l-sidebar-b",
                        icon: UserCircleIcon
                    }
                ],
                page: ProfilePage,
                path: "profile",
                plugin: "sage"
            }
        )
    }, []);

    useEffect(() => {
        function loadPlugins(baseDir: string) {
            fs.readdir(baseDir, (err, files) => {
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }
                files.forEach(function (file) {
                    const pluginPackagePath = path.resolve(baseDir, file, "package.json");
                    if (fs.existsSync(pluginPackagePath)) {
                        const pluginPackage = JSON.parse(fs.readFileSync(pluginPackagePath).toString())
                        const pluginDistPath = path.resolve(baseDir, file, "dist", "cjs", "plugin.js");
                        console.log("loading", pluginDistPath)
                        const pluginRaw = fs.readFileSync(pluginDistPath).toString()
                        const entry = eval(pluginRaw);
                        const plugin: RegisteredPlugin = entry();
                        plugin.name = pluginPackage.name;
                        pluginManager.registerPlugin(plugin)
                        plugin.start(echoContext)
                    }
                });
            });
        }

        loadPlugins(path.resolve("..", "echo-plugin-examples"))
    }, []);


    const themes = ['root']
    const [selectedTheme, setSelectedTheme] = useState(themes[0])

    return (
        <div className="h-screen w-screen text-primary-text" data-theme={selectedTheme}>
            <div
                className="w-12 border-r-2 shadow-sm border-black h-full fixed flex flex-col bg-secondary-surface p-2 gap-2">
                <RouterIconNavigator location="l-sidebar-m"/>
                <div className="flex-1"></div>
                <RouterIconNavigator location="l-sidebar-b"/>
            </div>
            <div className="ml-12 pb-7 h-full">
                <PluginBody/>
            </div>
            <div className="bg-secondary-surface fixed bottom-0 h-7 w-full ml-12"></div>
        </div>
    );
};

const RouterIconNavigator = ({location}: { location: string }) => {
    const currentRoutes = useCurrentRoutes()
    const currentRoute = useCurrentRoute()

    return <>{currentRoutes.flatMap((echoRoute) => {
            return (echoRoute.navItems ?? [])
                .filter((e) => e.location === location)
                .map((navItem) => {
                    const Icon = navItem.icon ?? QuestionMarkCircleIcon
                    return (
                        <Icon
                            className={"h-7 w-7 cursor-pointer " + (currentRoute === echoRoute ? "text-blue-600" : "")}
                            onClick={() => {
                                ECHO_ROUTER.push(echoRoute)
                            }}>
                        </Icon>
                    )
                })
        }
    )}</>
}


const setupRoutes = (echoRouter: EchoRouter) => {
    console.log("setup route")
    echoRouter.registerRoute({
            navItems: [
                {
                    location: "l-sidebar-b",
                    icon: UserCircleIcon
                }
            ],
            page: DefaultPage,
            path: "profile",
            plugin: "sage"
        }
    )
}

const DefaultPage = () => {
    return <>Welcome to PoeStack - Sage</>
}