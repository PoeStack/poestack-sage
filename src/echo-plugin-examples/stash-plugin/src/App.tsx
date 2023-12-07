import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Toaster } from 'echo-common/components-v1'
import { LeagueSelect } from './components/LeagueSelect'
import { PoePartialStashTab } from 'sage-common'
import { StashList } from './components/StashList'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { StashItemsDetails } from './components/StashItemsDetails'

const App = () => {
  const [selectedLeague, setSelectedLeague] = useState('')
  const [selectedStash, setSelectedStash] = useState<PoePartialStashTab | undefined>()

  const handleLeagueSelect = (league: string) => {
    if (selectedLeague !== league) {
      setSelectedStash(undefined)
      setSelectedLeague(league)
    }
  }

  return (
    <>
      <div className="flex flex-col w-full p-4 gap-4">
        <div className="text-bold text-lg">Stash Tab Demo</div>
        <div className="flex flex row gap-2 justify-start items-center">
          <div className="w-full">
            <LeagueSelect onLeagueSelect={handleLeagueSelect} />
          </div>
          {selectedLeague && (
            <StashList
              league={selectedLeague}
              selectedStash={selectedStash}
              onStashSelect={setSelectedStash}
            />
          )}
          {!selectedLeague && (
            <Button
              className="w-full justify-between"
              disabled
              variant="outline"
              aria-expanded={false}
            >
              Select stash tab...
              <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          )}
        </div>
        {selectedStash && (
          <StashItemsDetails selectedStash={selectedStash} league={selectedLeague} />
        )}
      </div>
      <Toaster />
    </>
  )
}

export default App
