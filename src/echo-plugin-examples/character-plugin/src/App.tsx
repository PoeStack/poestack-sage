import { useState } from 'react'
import { context } from './context'
import { CharacterSelect } from './components/CharacterSelect'
import { CharacterDetail } from './components/CharacterDetail'
import { Skeleton } from 'echo-common/components-v1'

const App = () => {
  const [characterName, setCharacterName] = useState<string | undefined>()
  const { value: characterList } = context().poeCharacters.useCharacterList()

  if (!characterList) {
    return (
      <div className="flex flex-col h-full w-full p-4 gap-4">
        <Skeleton className="h-8" />
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full w-full p-4 gap-4">
        <CharacterSelect characters={characterList} onCharacterSelect={setCharacterName} />
        {characterName && <CharacterDetail characterName={characterName} />}
      </div>
    </>
  )
}

export default App
