import React, {useEffect} from "react";

import {useEchoContext} from "poestack-echo-common";
import fs from "fs";

export const PluginPage: React.FC = () => {

    const {plugins, setSelectedPlugin, selectedPlugin, setPlugins} = useEchoContext()

    const PluginBody = selectedPlugin.component

    useEffect(() => {
        const f = fs.readFileSync("/Users/zach/workplace/poestack-sage/poestack-echo-plugins/example-plugin-ts/dist/cjs/plugin.js").toString()
        const x = eval(f);
        console.log("x", x)
        const e = x();
        console.log("e", e);
        setPlugins([...plugins, ...e.navItems])
    }, []);

    return (
        <div>
            <div>
                {plugins.map((plugin) => (
                    <div onClick={() => {
                        setSelectedPlugin(plugin)
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
