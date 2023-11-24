import { BehaviorSubject, concatMap, filter, from, map, mergeMap, tap, toArray } from "rxjs";
import { context } from "./entry";
import { bind } from "@react-rxjs/core";
import { EchoPoeItem, validResults } from "echo-common";

type SnapshotHistoryEntry = { totalValue: number, changeValue: number, items: EchoPoeItem[] }

type SnapshotStore = {
  lastZone?: string,
  lastSnapshot?: SnapshotHistoryEntry,
  history: SnapshotHistoryEntry[]
}

const snapshots = new BehaviorSubject<SnapshotStore>({ history: [] })
const sub = context().poeClientLog.logEvents$.subscribe((e) => {
  if (e.type === "ZoneEntranceEvent") {
    context().poeCharacters.characterList().pipe(
      validResults(),
      mergeMap((e) => e),
      filter(((e) => e?.current)),
      concatMap((e) => context().poeCharacters.character(e.name)),
      validResults(),
    ).subscribe((currentCharacter) => {
      context().poeValuations.withValuations("Ancestor", currentCharacter.inventory ?? []).pipe(
        toArray()
      ).subscribe((itemsWithValuations) => {
        console.log("items with valuations", itemsWithValuations)
        const totalVaulation = itemsWithValuations?.reduce((a, b) => {
          return a + (b?.valuation?.pvs[3] ?? 0)
        }, 0)

        const valueDiff = totalVaulation - (snapshots.value.lastSnapshot?.totalValue ?? 0)
        const entry = { totalValue: totalVaulation, changeValue: valueDiff, items: itemsWithValuations }
        snapshots.next({ lastZone: e.location, lastSnapshot: entry, history: [entry, ...snapshots.value.history] })
      })
    })
  }
})
context().subscriptions.push(sub)

const [useSnapshots] = bind(snapshots, { history: [] })

const App2 = () => {
  const snapshots = useSnapshots()
  return <>
    <div>
      <div
        className="bg-primary-accent px-1 py-0.5 rounded-lg pointer-cursor"
        onClick={() => { context().poeClientLog.logEvents$.next({ type: "ZoneEntranceEvent", location: "Hideout or something", raw: "asdasd" }) }}>
        fake event
      </div>
    </div>
    <div>
      {snapshots.history?.map((entry) => (<div>{entry.totalValue}: {entry.changeValue}</div>))}
    </div>
  </>
}

export default App2










