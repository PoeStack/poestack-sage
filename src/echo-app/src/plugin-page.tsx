import React, {useEffect, useState} from "react";

import {ECHO_ROUTER, EchoPluginHook} from "echo-common";
import fs from "fs";
import * as path from "path";
import {HomeIcon, UserCircleIcon} from "@heroicons/react/24/outline";
import {QuestionMarkCircleIcon} from "@heroicons/react/20/solid";
import {EchoRoute} from "echo-common/dist/cjs/echo-router";
import {bind} from "@react-rxjs/core";
import {ProfilePage} from "./profile-page";


const [useCurrentRoute] = bind(ECHO_ROUTER.currentRoute$)
const [useCurrentRoutes] = bind(ECHO_ROUTER.routes$)

export const PluginPage: React.FC = () => {
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
        ECHO_ROUTER.registerRoute(homeRoute)
        ECHO_ROUTER.push(homeRoute)

        ECHO_ROUTER.registerRoute({
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
                    if (file.endsWith(".js")) {
                        const p = path.resolve(baseDir, file)
                        console.log("loading", p)
                        const entry = module.require(p)
                        console.log("entry", entry)
                        const plugin: EchoPluginHook = entry();
                        plugin.start()
                    }
                });
            });
        }

        loadPlugins(path.resolve("..", "..", "dist_plugins"))
        loadPlugins("/Users/zach/workplace/poestack-sage/dist_plugins")
    }, []);


    const themes = ['root']
    const [selectedTheme, setSelectedTheme] = useState(themes[0])

    return (
        <div className="h-screen w-screen text-primary-text" data-theme={selectedTheme}>
            <div
                className="w-12 drop-shadow-md h-full fixed flex flex-col bg-secondary-surface items-center p-2 justify-center gap-2">
                <RouterIconNavigator location="l-sidebar-m"/>
                <div className="flex-1 border-gray-500 w-full border-b-2"></div>
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
                            className={"h-7 w-7 cursor-pointer " + (currentRoute === echoRoute ? "text-primary-accent" : "")}
                            onClick={() => {
                                ECHO_ROUTER.push(echoRoute)
                            }}>
                        </Icon>
                    )
                })
        }
    )}</>
}

const DefaultPage = () => {
    return <>Welcome to PoeStack - Sage</>
}