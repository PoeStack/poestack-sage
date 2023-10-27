import React from 'react';
import ReactDOM from 'react-dom';
import {PluginPage} from "./plugin-page";
import './app.css'
import {EchoContextProvider} from 'echo-common';
import {Subscribe} from "@react-rxjs/core";
import {AuthGuard} from "./auth-page";

const App: React.FC = () => {
    return (
        <>
            <Subscribe>
                <EchoContextProvider>
                    <AuthGuard>
                        <PluginPage/>
                    </AuthGuard>
                </EchoContextProvider>
            </Subscribe>
        </>
    );
};

ReactDOM.render(<App/>, document.getElementById('root'));