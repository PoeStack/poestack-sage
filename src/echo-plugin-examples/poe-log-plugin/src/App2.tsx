import { BehaviorSubject, concatMap, filter, from, map, mergeMap, of, tap, toArray } from "rxjs";
import { context } from "./entry";
import { bind } from "@react-rxjs/core";
import { validResults } from "echo-common";

type SnapshotStore = {
  lastZone?: string,
  lastSnapshot?: any,
  history: any[]
}

const snapshots = new BehaviorSubject<SnapshotStore>({ history: [] })
const sub = context().poeLog.logEvents$.subscribe((e) => {
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
        snapshots.next({ ...snapshots.value, lastZone: e.location, lastSnapshot: itemsWithValuations })
      })
    })
  }
})
context().subscriptions.push(sub)

const [useSnapshots] = bind(snapshots, { history: [] })

const App2 = () => {
  const snapshots = useSnapshots()
  return <>{JSON.stringify(snapshots)}</>
}

export default App2










