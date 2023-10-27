import {
    useStashes,
    useEchoContext, useStashItems,
} from 'echo-common'
import React, {useState} from 'react'

function App(): JSX.Element {
    const league = "Ancestor"

    const [searchString, setSearchString] = useState("")
    const {stashService} = useEchoContext()
    const stashes = useStashes(league)
    const stashItems = useStashItems(league)
        .filter((e) => !searchString.length || e.item.typeLine.toLowerCase().includes(searchString.toLowerCase()))
        .sort((a, b) => new Date(b.stash.loadedAtTimestamp).getTime() - new Date(a.stash.loadedAtTimestamp).getTime())

    stashService.currentStashes.load(league).subscribe()
    stashService.currentStashes.load("Standard").subscribe()

    return (
        <>
            <div className="flex flex-col h-full w-full pt-2 pl-2 pr-2">
                <div className="flex-shrink-0 flex flex-row gap-2 overflow-y-scroll pb-5 pt-2">
                    {stashes.map((e) => (
                        <div key={e.id}
                             style={{backgroundColor: `#${e.metadata.colour}`}}
                             className="flex-shrink-0 cursor-pointer py-2 px-4 shadow-md no-underline rounded-full  text-white text-sm hover:text-white hover:bg-blue-light focus:outline-none active:shadow-none mr-2"
                             onClick={() => stashService.currentStashContents.load(e.league + "_" + e.id).subscribe()}
                        >
                            {e.name}
                        </div>
                    ))}
                </div>
                <div className="flex-shrink-0">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchString}
                        onChange={(e) => setSearchString(e.target.value)}
                        className="w-full px-2 py-0.5 bg-input-surface rounded-lg shadow-md border-0 focus:outline-none focus:ring focus:border-primary-accent"
                    />
                </div>
                <div className="overflow-y-scroll flex-1 mt-2">
                    {
                        stashItems.map((e) => (
                            <div key={e.item.id}>
                                <div>
                                        <span
                                            style={{color: `#${e.stash.metadata.colour}`}}>{e.stash.name}</span>: {e.item.stackSize} {e.item.typeLine}
                                </div>
                                <div>
                                    {e.item.properties?.map((p) => (<li>{p.name}: {p.values.join(", ")}</li>))}
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </>
    )
}

export default App
