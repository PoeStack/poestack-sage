import React from 'react';
import ReactDOM from 'react-dom';
import {PluginPage} from "./plugin-page";
import './app.css'
import {EchoContextProvider} from 'poestack-echo-common';

const App: React.FC = () => {
    return (
        <>
            <EchoContextProvider>
                <PluginPage/>
            </EchoContextProvider>
        </>
    );
};

ReactDOM.render(<App/>, document.getElementById('root'));