import React, {useEffect, useMemo, useState} from "react";
import fs from "fs";

export const usePluginManager = () => {

    const defaultPlugin = {component: BaseComp};
    const [plugins, setPlugins] = useState([defaultPlugin])
    const [selectedPlugin, setSelectedPlugin] = useState(defaultPlugin)


    useEffect(() => {
        console.log("asdasd")
        const f = fs.readFileSync("/Users/zach/workplace/poestack-sage/poestack-echo-plugins/example-plugin-ts/dist/cjs/plugin.js").toString()
        const o = eval(f);
        console.log("o", o)
        const loadedPlugin = {component: o};
        setPlugins([...plugins, loadedPlugin])
        setSelectedPlugin(loadedPlugin)
    }, []);

    return {selectedPlugin, plugins, setSelectedPlugin};
}

export function BaseComp() {
    return <>base comp</>
}