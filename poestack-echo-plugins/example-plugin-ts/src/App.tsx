import {useEchoContext, useStashItems} from 'poestack-echo-common'
import React, {useEffect, useState} from 'react'


function App() {
    const [search, setSearch] = useState("")

    const {stashApi} = useEchoContext()
    const stashItems = useStashItems()
    useEffect(() => {
        stashApi.getStashes("Ancestor").subscribe()
    }, []);

    return (
        <>
            <div>
                <input
                    className="appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div>
                    {stashItems
                        .filter((e) => !!e.note)
                        .filter((item) => !search.length || item.typeLine.toLowerCase().includes(search.toLowerCase()))
                        .map((item) => (<div>{item.typeLine}: {item.note}</div>))}
                </div>
            </div>
        </>
    )
}

export default App
