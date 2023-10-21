import React, {useEffect} from "react";

import {useEchoContext} from "poestack-echo-common";
import fs from "fs";

export const PluginPage: React.FC = () => {

    const {pluginManager} = useEchoContext()

    const PluginBody = pluginManager.selectedPlugin.component

    useEffect(() => {
        const f = fs.readFileSync("/Users/zach/workplace/poestack-sage/poestack-echo-plugins/example-plugin-ts/dist/cjs/plugin.js").toString()
        const entry = eval(f);
        const plugin = entry();
        const mapping = plugin.start()
        pluginManager.setPlugins([...pluginManager.plugins, ...mapping.navItems])
    }, []);

    return (
        <div>
            <div>
                {pluginManager.plugins.map((plugin) => (
                    <div onClick={() => {
                        pluginManager.setSelectedPlugin(plugin)
                    }}>
                        Plugin: {plugin.name}
                    </div>
                ))}
            </div>

            <div style={{paddingTop: "10px"}}>
                <PluginBody/>
            </div>
        </div>
    );
};
