import React, {useState} from 'react';
import ReactDOM from 'react-dom';

const App: React.FC = () => {
    const x = require("/Users/zach/workplace/poestack-sage/poestack-echo-plugins/stash-view/dist/index.js").StashViewPlugin();
    return (
        <div>
            {x}
            <h1>Hello, React Electron TypeScript App!</h1>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));