import { bind } from '@react-rxjs/core'
import { BehaviorSubject, combineLatestWith, filter, interval, map } from 'rxjs'
import { context } from './entry'

const lastZone$ = new BehaviorSubject(null)
context()
  .poeLog.logEvents$.pipe(filter((e) => e.type == 'ZoneEntranceEvent'))
  .subscribe(lastZone$)

export const [useCurrentZone] = bind(
  interval(100).pipe(
    combineLatestWith(lastZone$),
    map(([, e]) => (e ? { ...e, timeInZone: Date.now() - e.timestamp } : null))
  ),
  null
)

const App = () => {
  const currentZone: { location: string; timeInZone: number } = useCurrentZone()

  if (!currentZone) {
    return <>Change zone to start plugin.</>
  }

  if (currentZone.location.includes('Hideout')) {
    return <>Time wasted in hideout {currentZone.timeInZone / 1000} seconds, get back to mapping!</>
  }

  return <>In {currentZone.location}, good job!</>
}

export default App
