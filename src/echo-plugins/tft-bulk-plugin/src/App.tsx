import { LeagueSelect } from './components/LeagueSelect'
import { StashItemsDetails } from './components/StashItemsDetails'
import { setLeague } from './hooks/tft-config'
import { useTftFilteredItems } from './hooks/tft-items'
import { ControlPanel } from './components/ControlPanel'

const App = () => {
  const items = useTftFilteredItems()

  return (
    <>
      <div className='flex flex-col'>
        <LeagueSelect onLeagueSelect={(e) => {
          setLeague(e)
        }} />
        <div className='flex flex-row'>
          <ControlPanel />
          <StashItemsDetails items={items} />
        </div>
      </div>
    </>
  )
}

export default App
