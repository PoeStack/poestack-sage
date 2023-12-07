import { bind } from '@react-rxjs/core'
import { PoeZoneEntranceEvent } from 'echo-common'
import { BehaviorSubject, combineLatestWith, filter, interval, map } from 'rxjs'
import { context } from './context'
import { Card } from 'echo-common/components-v1'
import dayjs from 'dayjs'

const lastZone$ = new BehaviorSubject<PoeZoneEntranceEvent | null>(null)
context()
  .poeClientLog.logEvents$.pipe(
    filter((e): e is PoeZoneEntranceEvent => e.type === 'ZoneEntranceEvent')
  )
  .subscribe(lastZone$)

const zones: Array<PoeZoneInstance> = []
let lastZoneActual: PoeZoneInstance | null = null

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

const ZoneTracker = () => {
  const currentZone = useCurrentZone()

  if (!currentZone) {
    return (
      <div className="flex flex-col justify-center items-start gap-4">
        <h2 className="text-md text-semibold">Current Zone</h2>
        <p>Change zone to start plugin.</p>
      </div>
    )
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
    <div className="flex flex-col justify-center items-start gap-4">
      <h2 className="text-md text-semibold">Current Zone</h2>
      <ul>
        <li className="text-md">Location: {currentZone.location}</li>
        <li className="text-sm">Time: {dayjs(currentZone.time).format('MM-DD-YYYY hh:mm')}</li>
      </ul>
      <h2 className="text-md text-semibold">Zone History</h2>
      <div className="flex flex-row border rounded-md flex-wrap w-full p-2 gap-2 overflow-y-scroll h-72">
        {zones.length > 0 &&
          zones.map((zone) => (
            <Card key={`${zone.location}_${zone.timeDelta}`} className="h-48 w-48">
              <Card.Header>
                <Card.Title>{zone.location}</Card.Title>
              </Card.Header>
              <Card.Content className="text-sm">
                <ul>
                  <li>Time: {dayjs(zone.time).format('MM-DD-YYYY hh:mm')}</li>
                  <li>Duration: {Math.round((zone.timeDelta / 1000) * 10) / 10} seconds</li>
                </ul>
              </Card.Content>
            </Card>
          ))}
      </div>
    </div>
  )
}

export default ZoneTracker
