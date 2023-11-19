import { bind } from '@react-rxjs/core'
import { PoeZoneEntranceEvent } from 'echo-common'
import { BehaviorSubject, combineLatestWith, filter, interval, map } from 'rxjs'
import { context } from './entry'

const lastZone$ = new BehaviorSubject<PoeZoneEntranceEvent>(null)
context()
  .poeLog.logEvents$.pipe(filter((e) => e.type == 'ZoneEntranceEvent'))
  .subscribe(lastZone$)

const zones: Array<PoeZoneInstance> = []
let lastZoneActual: PoeZoneInstance = null

interface PoeZoneInstance {
  location: string
  time: Date
  timeDelta: number
}

export const [useCurrentZone] = bind(
  interval(100).pipe(
    combineLatestWith(lastZone$),
    map(([, e]) =>
      e
        ? {
            location: e.location,
            time: e.time,
            timeDelta: new Date().getTime() - e.time.getTime()
          }
        : null
    )
  ),
  null
)

const App = () => {
  const currentZone: { location: string; time: Date; timeDelta: number } = useCurrentZone()

  if (!currentZone) {
    return <>Change zone to start plugin.</>
  }

  if (!lastZoneActual) {
    const newZone: PoeZoneInstance = {
      location: currentZone.location,
      time: currentZone.time,
      timeDelta: currentZone.timeDelta
    }
    lastZoneActual = newZone
  }

  if (currentZone.location != lastZoneActual.location) {
    zones.unshift(lastZoneActual)
    console.debug(JSON.stringify(zones))
    const newZone: PoeZoneInstance = {
      location: currentZone.location,
      time: currentZone.time,
      timeDelta: currentZone.timeDelta
    }
    lastZoneActual = newZone
  } else {
    lastZoneActual = currentZone
  }

  return (
    <>
      <div>
        <p>
          At: {currentZone.time.toISOString()} | In {currentZone.location} for{' '}
          {Math.round((currentZone.timeDelta / 1000) * 10) / 10}
        </p>
      </div>
      {zones.length > 0 &&
        zones.map((zone) => (
          <div>
            <p>
              At: {zone.time.toISOString()} | In {zone.location} for{' '}
              {Math.round((zone.timeDelta / 1000) * 10) / 10}
            </p>
          </div>
        ))}
    </>
  )

  if (currentZone.location.includes('Hideout')) {
    return (
      <>
        Time wasted in hideout {currentZone.time ? currentZone.time.toISOString() : 'not there :/'}{' '}
        seconds, get back to mapping!
      </>
    )
  }

  return (
    <>
      At: {currentZone.time.toISOString()} | In {currentZone.location}, good job!{' '}
      {(Math.round((currentZone.timeDelta / 1000) * 10) / 10).toFixed(1)}
    </>
  )
}

export default App
