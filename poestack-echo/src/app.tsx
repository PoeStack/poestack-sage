import * as ReactDOM from 'react-dom';
import {HashRouter, Route, Routes} from "react-router-dom";
import React from "react";
import PluginList from "./sage/plugin-list";
import * as Path from "path";
import {StashViewPlugin} from "poestack-plugin-stash-view/dist";


declare var __non_webpack_require__: any;

function SageApp() {

    const routes: { path: string, element: React.ReactNode }[] = [];

    //const pluginObject = __non_webpack_require__(Path.resolve(process.cwd(), "..", "poestack-echo-plugins/stash-view/dist/index.js")).StashViewPlugin();
    routes.push({path: "/", element: <></>})
    routes.push({path: "/stashView", element: <StashViewPlugin/>})

    return <>
        <HashRouter>

            <PluginList/>
            <Routes>
                {routes.map((r) => (<Route path={r.path} element={r.element}/>))}
            </Routes>
        </HashRouter>
    </>
}

ReactDOM.render(<SageApp/>, document.body);