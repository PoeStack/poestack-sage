import React from 'react';
import ReactDOM from 'react-dom';
import {PluginPage} from "./plugin-page";
import './app.css'
import { EchoContextProvider } from 'poestack-echo-common';

const App: React.FC = () => {
    return (
        <div className="bg-blue-500">
            <EchoContextProvider>
                <PluginPage/>
            </EchoContextProvider>
        </div>
    );
};

ReactDOM.render(<App/>, document.getElementById('root'));