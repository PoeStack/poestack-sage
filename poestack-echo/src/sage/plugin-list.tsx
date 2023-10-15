import React from "react";
import {Link} from "react-router-dom";

export default function PluginList() {
    return <>
        <div>
            <div className="flex flex-row gap-2 bg-black text-white">
                <Link to="/"><h2>Home</h2></Link>
                <Link to="/stashView"><h2>Stash Views</h2></Link>
            </div>
        </div>
    </>
}