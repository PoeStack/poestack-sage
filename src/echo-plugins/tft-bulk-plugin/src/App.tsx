import { useEffect, useState } from 'react'
import { LeagueSelect } from './components/LeagueSelect'
import { StashItemsDetails } from './components/StashItemsDetails'
import { StashList } from './components/StashList'
import { PoePartialStashTab } from 'sage-common'
import { from, mergeMap, tap, toArray } from 'rxjs'
import { EchoPoeItem, validResults } from 'echo-common'
import { context } from './context'

const App = () => {
  const [league, setLeague] = useState("Affliction")
  const [stashes, setStashes] = useState<PoePartialStashTab[]>([])

  const [items, setItems] = useState<EchoPoeItem[]>([])
  useEffect(() => {
    from(stashes).pipe(
      mergeMap((stash) => context().poeStash.stashTab(league, stash?.id!!)),
      validResults(),
      mergeMap((r) => context().poeValuations.withValuationsResultOnly(league, r.items ?? [])),
      toArray(),
    ).subscribe((e) => setItems(e))
  }, [league, stashes])
  const filteredItems = items.filter((e) => {
    return !!e.group && !!e.valuation
  })

  return (
    <>
      <div className='flex flex-col'>
        <LeagueSelect onLeagueSelect={(e) => {
          setLeague(e)
        }} />
        <div className='flex flex-row'>
          <div className='flex flex-col'>
            <StashList league={league} onChange={(s) => { setStashes(s) }} />
            <div>
              <div>
               Total value: {filteredItems.reduce((p, c) => p + (c.valuation?.primaryValue ?? 0), 0)}
              </div>
              <div>Post Message</div>
            </div>
          </div>

          <StashItemsDetails items={filteredItems} />
        </div>
      </div>
    </>
  )
}

export default App
