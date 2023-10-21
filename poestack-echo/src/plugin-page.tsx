import React from "react";
import {usePluginManager} from "./plugins-hook";

export const PluginPage: React.FC = () => {

    const {selectedPlugin, setSelectedPlugin, plugins} = usePluginManager()

    const PluginBody = selectedPlugin.component

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
