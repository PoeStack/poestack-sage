import * as ReactDOM from 'react-dom';
import {HashRouter, Route, Routes} from "react-router-dom";
import React from "react";
import LadderView from "./test/hone";

declare var __non_webpack_require__: any;

function SageApp() {

    const routes: { path: string, element: React.ReactNode }[] = [];


    const pluginObject = __non_webpack_require__("/Users/zach/workplace/poestack-sage/poestack-echo-plugins/stash-view/dist/index.js").StashViewPlugin();
    routes.push({path: "/", element: LadderView()})
    routes.push({path: "/stashView", element: pluginObject})

    return <>
        <HashRouter>
            <Routes>
                {routes.map((r) => (<Route path={r.path} element={r.element}/>))}
            </Routes>
        </HashRouter>
    </>
}

ReactDOM.render(<SageApp/>, document.body);