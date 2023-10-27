import React from 'react'
import {POE_CHARACTER_SERVICE, usePoeCharacterList} from "echo-common";

function App(): JSX.Element {

    const characterList = usePoeCharacterList()

    POE_CHARACTER_SERVICE.characterList.load("character_list").subscribe()

    return (
        <>
            <div className="flex flex-col h-full w-full pt-2 pl-2 pr-2">
                Characters plugins
                {JSON.stringify(characterList)}
            </div>
        </>
    )
}

export default App
