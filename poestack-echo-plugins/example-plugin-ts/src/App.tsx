import {
    useCurrentStashesFlat,
    useEchoContext, useStashItems,
} from 'poestack-echo-common'
import React from 'react'
import {PoePartialStashTab} from "poe-api";

function App(): JSX.Element {
    const league = "Ancestor"

    const {stashService} = useEchoContext()
    const stashes = useCurrentStashesFlat()
    const stashItems = useStashItems(league)
        .sort((a, b) => b.stash.loadedAtTimestamp.getTime() - a.stash.loadedAtTimestamp.getTime())

    function onStashClicked(stash: PoePartialStashTab) {
        stashService.stashApi.getStashContent(league, stash.id!).subscribe()
    }

    return (
        <>
            <div>
                <button className="py-2 px-4 rounded bg-blue-500" onClick={() => {
                    stashService.stashApi.getStashes(league).subscribe()
                }}>
                    Load Stashes
                </button>
                <div className="flex flex-row gap-2 overflow-y-scroll pb-5">
                    {stashes.map((e) => (
                        <div key={e.id} className="flex-shrink-0 cursor-pointer" onClick={() => {
                            onStashClicked(e)
                        }}>{e.name}</div>
                    ))}
                </div>
                <div>
                    <div>
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
            </div>
        </>
    )
}

export default App
