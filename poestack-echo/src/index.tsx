import React from 'react';
import ReactDOM from 'react-dom';
import {PluginPage} from "./plugin-page";
import { EchoContextProvider } from 'poestack-echo-common';

const App: React.FC = () => {
    return (
        <div>
            <EchoContextProvider>
                <PluginPage/>
            </EchoContextProvider>
        </div>
    );
};

ReactDOM.render(<App/>, document.getElementById('root'));