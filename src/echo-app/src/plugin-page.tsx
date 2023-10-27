import React, {useEffect, useState} from "react";

import {RegisteredPlugin, useEchoContext} from "echo-common";
import fs from "fs";
import * as path from "path";
import {UserCircleIcon} from "@heroicons/react/24/outline";
import {QuestionMarkCircleIcon} from "@heroicons/react/20/solid";

export const PluginPage: React.FC = () => {
    const echoContext = useEchoContext()
    const pluginManager = echoContext.pluginManager
    const echoRouter = echoContext.echoRouter

    const PluginBody = echoRouter.current?.page ?? DefaultPage

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
                <RouterIconNavigator location="l-sidebar-m"/>
            </div>
            <div className="ml-12 pb-7 h-full">
                <PluginBody/>
            </div>
            <div className="bg-secondary-surface fixed bottom-0 h-7 w-full ml-12"></div>
        </div>
    );
};

const RouterIconNavigator = ({location}: { location: string }) => {
    const echoContext = useEchoContext()
    const pluginManager = echoContext.pluginManager
    const echoRouter = echoContext.echoRouter
    return <>{echoRouter.routes.flatMap((echoRoute) => {
            return (echoRoute.navItems ?? [])
                .filter((e) => e.location === location)
                .map((navItem) => {
                    const Icon = navItem.icon ?? QuestionMarkCircleIcon
                    return (
                        <Icon
                            className={"h-7 w-7 cursor-pointer " + (echoRouter.current === echoRoute ? "text-blue-600" : "")}
                            onClick={() => {
                                echoRouter.push(echoRoute)
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