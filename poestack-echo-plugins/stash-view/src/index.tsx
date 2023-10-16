import React, {useState} from 'react';

function StashViewPlugin() {
    window['React2'] = require('react');
    const [xx, setXX] = useState("ddddddd");
    return <div>{xx}</div>
}

export {
    StashViewPlugin
}