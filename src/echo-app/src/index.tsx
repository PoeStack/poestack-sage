import {Module} from "module";

const originalResolveFilename = Module['_resolveFilename'];
Module["_resolveFilename"] = function (request, parent) {
    const res = originalResolveFilename(request, parent)
    const rPath = path.resolve(".", "node_modules", request, 'index.js')
    if (fs.existsSync(rPath)) {
        console.log(request, "found", rPath, "vs", res)
        return rPath
    }

    return res;
};

import React from 'react';
import {PluginPage} from "./plugin-page";
import './app.css'
import {Subscribe} from "@react-rxjs/core";
import {AuthGuard} from "./auth-page";
import {POE_LOG_SERVICE} from "echo-common";
import {createRoot} from 'react-dom/client';
import * as path from "path";
import fs from "fs";

POE_LOG_SERVICE.logRaw$.subscribe((e) => console.log("GGG LOG", e))

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


const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App/>);