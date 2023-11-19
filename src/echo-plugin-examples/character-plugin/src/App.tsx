import { useState } from 'react'
import { context } from './entry'

const App = () => {
  const { value: characterList } = context().poeCharacters.useCharacterList()

  const [characterName, setCharacterName] = useState(null)
  const { value: character, valueAge } = context().poeCharacters.useCharacter(characterName)

  return (
    <>
      <div className="flex h-full w-full pt-2 pl-2 pr-2">
        <div className="flex-shrink-0 flex flex-col gap-2 h-full overflow-y-scroll pr-4">
          {characterList?.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setCharacterName(c.name)
              }}
              className="cursor-pointer bg-input-surface rounded-lg p-2 flex flex-col"
            >
              <div className="font-semibold text-primary-accent">{c.name}</div>
              <div>
                lvl {c.level} {c.class}
              </div>
              <div>{c.league}</div>
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col h-full">
          <div className="font-semibold">{character?.name}</div>
          <div className="font-semibold">{valueAge()}</div>
          <div className="flex flex-col h-full overflow-y-scroll">
            {character &&
              [...character.inventory, ...character.equipment, ...character.jewels].map((item) => (
                <div key={item.id}>{item.typeLine}</div>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
