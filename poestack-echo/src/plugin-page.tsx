import React, {useEffect} from "react";

import {useEchoContext} from "poestack-echo-common";
import fs from "fs";

export const PluginPage: React.FC = () => {

    const echoContext = useEchoContext()
    const pluginManager = echoContext.pluginManager

    const PluginBody = pluginManager.selectedPlugin.component

    useEffect(() => {
        const f = fs.readFileSync("/Users/zach/workplace/poestack-sage/poestack-echo-plugins/example-plugin-ts/dist/cjs/plugin.js").toString()
        const entry = eval(f);
        const plugin = entry();
        plugin.start(echoContext)
    }, []);

    return (
        <div className="min-h-screen flex flex-row gap-1 text-white">
            <div className="flex flex-col bg-black p-2">
                {pluginManager.plugins.map((plugin) => (
                    <div className="cursor-pointer" onClick={() => {
                        pluginManager.setSelectedPlugin(plugin)
                    }}>
                        {plugin.name}
                    </div>
                ))}
            </div>

            <div className="max-h-screen w-full p-3 overflow-y-scroll">
                <PluginBody/>
            </div>
        </div>
    );
};
