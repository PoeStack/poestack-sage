import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import * as fs from "fs";


var x = null
window['registerString'] = function (name, comp) {
    console.log("register", name, comp)
    x = comp
}
const f = fs.readFileSync("/Users/zach/workplace/poestack-sage/poestack-echo-plugins/example-plugin/dist/my-tiny-library.umd.js").toString()
eval(f);

const App: React.FC = () => {
    return (
        <div>
            {x()}
            <h1>Hello, React Electron TypeScript App!</h1>
        </div>
    );
};

ReactDOM.render(<App/>, document.getElementById('root'));