import { useState } from 'react'
import { bind } from '@react-rxjs/core'
import { context } from './entry'

const [usePoeCharacterList] = bind(context().poeCharacters.characterListCache.memoryCache$, {})

const App = () => {
  const [selectedName, setSelectedName] = useState<string | null>(null)

  const characterList = usePoeCharacterList()

  context().poeCharacters.characterListCache.load({key: "*", source: ""}).subscribe()

  return (
    <>
      <div className="flex h-full w-full pt-2 pl-2 pr-2">
        <div className="flex-shrink-0 flex flex-col gap-2 h-full overflow-y-scroll pr-4">
          {characterList['*']?.lastResultEvent?.result?.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setSelectedName(c.name)
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
          <div className="font-semibold">{selectedName}</div>
        </div>
      </div>
    </>
  )
}

export default App
