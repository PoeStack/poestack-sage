import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import * as fs from "fs";
import {usePluginManager} from "./plugins-hook";


const App: React.FC = () => {

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

ReactDOM.render(<App/>, document.getElementById('root'));