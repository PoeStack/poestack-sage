import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import * as fs from "fs";
import {usePluginManager} from "./plugins-hook";


const App: React.FC = () => {

    const {selectedPlugin, setSelectedPlugin, plugins} = usePluginManager()

    const PluginBody = selectedPlugin.component

    return (
        <div>
            <button onClick={() => {
                const next = plugins.indexOf(selectedPlugin) + 1;
                setSelectedPlugin(plugins[next >= plugins.length ? 0 : next])
            }}>Switch
            </button>
            <PluginBody/>
        </div>
    );
};

ReactDOM.render(<App/>, document.getElementById('root'));