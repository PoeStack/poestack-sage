import * as ReactDOM from 'react-dom';
import * as fs from 'fs';

function render() {
    const s: {
        name: String,
        id: String
    }[] = JSON.parse(fs.readFileSync("/Users/zach/workplace/poestack-sage/poe-offline-data/stash/run-1/tabs.json").toString())

    ReactDOM.render(
        <div className="bg-gray-300 text-center text-blue-800">
            {s.map((e) => (<li>{e.name} {e.id}</li>))}
        </div>
        , document.body);
}

render();