// noinspection JSUnusedGlobalSymbols

import App from "./App";

function start() {
    console.log("entry")
    return {
        navItems: [{name: "ExamplePlugin v2", component: App}]
    }
}

function destroy() {
}

export default function () {
    return {
        start: start,
        destroy: destroy
    }
}