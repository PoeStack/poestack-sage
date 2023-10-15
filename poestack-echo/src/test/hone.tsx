import React from "react";
import {Link} from "react-router-dom";

export default function LadderView() {
    return <>
        <div>
            <div className="menu">
                <Link to="/"><h2>Home</h2></Link>
                <Link to="/test"><h2>Stand</h2></Link>
                <Link to="/stashView"><h2>Sit</h2></Link>
            </div>
        </div>
    </>
}