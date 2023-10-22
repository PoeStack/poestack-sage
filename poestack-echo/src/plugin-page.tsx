import React, {useEffect} from "react";

import {RegisteredPlugin, useEchoContext} from "poestack-echo-common";
import fs from "fs";

export const PluginPage: React.FC = () => {

    const echoContext = useEchoContext()
    const pluginManager = echoContext.pluginManager

    const PluginBody = pluginManager.selectedNavItem.page

    useEffect(() => {
        const f = fs.readFileSync("/Users/zach/workplace/poestack-sage/poestack-echo-plugins/example-plugin-ts/dist/cjs/plugin.js").toString()
        const entry = eval(f);
        const plugin: RegisteredPlugin = entry();
        pluginManager.registerPlugin(plugin)
        plugin.start(echoContext)
    }, []);

    return (
        <div className="min-h-screen flex flex-row gap-1 text-white">
            <div className="flex flex-col bg-black p-2">
                {pluginManager.registeredPluginNavItems.map((navItem) => (
                    <div className="cursor-pointer" onClick={() => {
                        pluginManager.setSelectedNavItem(navItem)
                    }}>
                        {navItem.name}
                    </div>
                ))}
            </div>

            <div className="max-h-screen w-full p-3 overflow-y-scroll">
                <PluginBody/>
            </div>
        </div>
    );
};
