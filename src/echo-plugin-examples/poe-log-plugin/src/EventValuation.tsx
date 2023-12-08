import { BehaviorSubject, concatMap, filter, mergeMap, toArray } from 'rxjs'
import { bind } from '@react-rxjs/core'
import { EchoPoeItem, validResults } from 'echo-common'
import { context } from './context'
import { Card } from 'echo-common/components-v1'

type SnapshotHistoryEntry = { totalValue: number; changeValue: number; items: EchoPoeItem[] }

type SnapshotStore = {
  lastZone?: string
  lastSnapshot?: SnapshotHistoryEntry
  history: SnapshotHistoryEntry[]
}

const snapshots = new BehaviorSubject<SnapshotStore>({ history: [] })
const sub = context().poeClientLog.logEvents$.subscribe((e) => {
  if (e.type === 'ZoneEntranceEvent') {
    context()
      .poeCharacters.characterList()
      .pipe(
        validResults(),
        mergeMap((e) => e),
        filter((e) => !!e.current),
        concatMap((e) => context().poeCharacters.character(e.name || '')),
        validResults()
      )
      .subscribe((currentCharacter) => {
        context()
          .poeValuations.withValuationsResultOnly('Standard', currentCharacter.inventory ?? [])
          .pipe(toArray())
          .subscribe((itemsWithValuations) => {
            console.log('items with valuations', itemsWithValuations)
            const totalVaulation = itemsWithValuations?.reduce((a, b) => {
              return a + (b?.valuation?.primaryValue ?? 0)
            }, 0)

            const valueDiff = totalVaulation - (snapshots.value.lastSnapshot?.totalValue ?? 0)
            const entry = {
              totalValue: totalVaulation,
              changeValue: valueDiff,
              items: itemsWithValuations
            }
            snapshots.next({
              lastZone: e.location,
              lastSnapshot: entry,
              history: [entry, ...snapshots.value.history]
            })
          })
      })
  }
})
context().subscriptions.push(sub)

const [useSnapshots] = bind(snapshots, { history: [] })

const EventValuation = () => {
  const snapshots = useSnapshots()
  return (
    <div className="flex flex-col justify-center items-start gap-4">
      <h2 className="text-md text-semibold">Current Zone</h2>
      <div className="flex flex-row border rounded-md flex-wrap w-full p-2 gap-2 overflow-y-scroll h-72">
        {snapshots.history?.map((entry, i) => (
          <Card key={`${entry.changeValue}-${i}`} className="h-48 w-48">
            <Card.Header>
              <Card.Title>{snapshots.lastZone}</Card.Title>
            </Card.Header>
            <Card.Content className="text-sm">
              <ul>
                <li>Total Value: {entry.totalValue}</li>
                <li>Change in Value: {entry.changeValue}</li>
              </ul>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default EventValuation
