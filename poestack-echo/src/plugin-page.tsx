import React, {useEffect, useState} from "react";

import {RegisteredPlugin, useEchoContext} from "poestack-echo-common";
import fs from "fs";
import * as path from "path";

export const PluginPage: React.FC = () => {
    const echoContext = useEchoContext()
    const pluginManager = echoContext.pluginManager

    const PluginBody = pluginManager.selectedNavItem.page

    useEffect(() => {
        function loadPlugins(baseDir: string) {
            fs.readdir(baseDir, (err, files) => {
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }
                files.forEach(function (file) {
                    const pluginDistPath = path.resolve(baseDir, file, "dist", "cjs", "plugin.js");
                    console.log("loading", pluginDistPath)
                    const pluginRaw = fs.readFileSync(pluginDistPath).toString()
                    const entry = eval(pluginRaw);
                    const plugin: RegisteredPlugin = entry();
                    pluginManager.registerPlugin(plugin)
                    plugin.start(echoContext)
                });
            });
        }

        loadPlugins(path.resolve("..", "poestack-echo-plugins"))
    }, []);


    const themes = ['Default', "Dark"]
    const [selectedTheme, setSelectedTheme] = useState(themes[0])

    return (
        <div className="min-h-screen flex flex-row gap-1 text-white" data-theme={selectedTheme}>
            <div className="flex flex-col bg-neutral p-2">
                {pluginManager.registeredPluginNavItems.map((navItem) => (
                    <div className="cursor-pointer" onClick={() => {
                        pluginManager.setSelectedNavItem(navItem)
                    }}>
                        {navItem.name}
                    </div>
                ))}
                <div className="flex-grow"></div>
                {
                    themes.map((t) => (<div onClick={() => {setSelectedTheme(t)}}>{t}</div>))
                }
            </div>

            <div className="max-h-screen w-full p-3 overflow-y-scroll">
                <PluginBody/>
            </div>
        </div>
    );
};
