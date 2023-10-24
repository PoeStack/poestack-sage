import React from 'react';
import ReactDOM from 'react-dom';
import {PluginPage} from "./plugin-page";
import './app.css'
import {EchoContextProvider} from 'poestack-echo-common';
import {Subscribe} from "@react-rxjs/core";

const App: React.FC = () => {
    return (
        <>
            <Subscribe>
                <EchoContextProvider>
                    <PluginPage/>
                </EchoContextProvider>
            </Subscribe>
        </>
    );
};

ReactDOM.render(<App/>, document.getElementById('root'));