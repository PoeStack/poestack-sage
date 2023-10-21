import {EchoContext, EchoContextType, SageTestComp} from 'poestack-echo-common'
import React, {useEffect, useState} from 'react'


function App() {
    /*    const stashItems = useStashItems()*/

    const [search, setSearch] = useState("")


    /*
        useEffect(() => {
            stashApi.getStashes("Ancestor").subscribe()
        }, []);
    */

    const { test} = React.useContext(EchoContext) as EchoContextType;


    return (
        <>
            <div>
                <input
                    value={search}
                    onChange={(e) => test()}
                />
                <SageTestComp/>
                {/*         <div>
                    {stashItems
                        .filter((item) => !search.length || item.typeLine.toLowerCase().includes(search.toLowerCase()))
                        .map((item) => (<div>{item.typeLine}</div>))}
                </div>*/}
            </div>
        </>
    )
}

export default App
