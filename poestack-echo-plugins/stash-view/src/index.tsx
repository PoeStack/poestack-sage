import * as fs from "fs";

function StashViewPlugin() {

    const poeItems = JSON.parse(fs.readFileSync("/Users/zach/workplace/poestack-sage/poe-offline-data/stash/run-1/f5c66b30a1.json").toString())

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