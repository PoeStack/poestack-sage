import * as fs from "fs";
import Path from "path";

function StashViewPlugin() {


    const poeItems = JSON.parse(fs.readFileSync(Path.resolve(process.cwd(), "..", "poe-offline-data/stash/run-1/f5c66b30a1.json")).toString())

    return <div>{poeItems?.items.map((e: any) => (
        <div>
            <div>{e.icon}</div>
            <img src={e.icon}/>
        </div>
    ))}</div>
}

export {
    StashViewPlugin
}