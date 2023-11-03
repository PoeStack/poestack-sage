import React from 'react';
import ReactDOM from 'react-dom';
import {PluginPage} from "./plugin-page";
import './app.css'
import {Subscribe} from "@react-rxjs/core";
import {AuthGuard} from "./auth-page";

const App: React.FC = () => {
    return (
        <>
            <Subscribe>
                <AuthGuard>
                    <PluginPage/>
                </AuthGuard>
            </Subscribe>
        </>
    );
};

ReactDOM.render(<App/>, document.getElementById('root'));