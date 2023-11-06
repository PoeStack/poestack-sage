import React from "react";

import {getCurrentWindow} from "@electron/remote"

export function PluginPageHeader() {
    return <div style={{'-webkit-app-region': "drag"} as unknown}
                className="bg-secondary-surface fixed top-0 h-7 w-full">
        <div
            className="flex items-center space-x-2 h-full pl-2"
            style={{'-webkit-app-region': "no-drag"} as unknown}
        >
            <div className="w-3 h-3 bg-red-500 rounded-full"
                 onClick={() => {
                     getCurrentWindow().close();
                 }}>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"
                 onClick={() => {
                     getCurrentWindow().minimize();
                 }}>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"
                 onClick={() => {
                     if (getCurrentWindow().isMaximized()) {
                         getCurrentWindow().unmaximize();
                     } else {
                         getCurrentWindow().maximize();
                     }
                 }}>
            </div>
        </div>
    </div>
}
