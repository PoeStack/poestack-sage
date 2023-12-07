import { Button, Tabs } from 'echo-common/components-v1'
import ZoneTracker from './ZoneTracker'
import EventValuation from './EventValuation'
import { context } from './context'

const App = () => {
  return (
    <div className="flex flex-col w-full p-4 gap-4">
      <div className="text-bold text-lg">PoE Log Events Demo</div>
      <div>
        <Button
          onClick={() => {
            context().poeClientLog.logEvents$.next({
              type: 'ZoneEntranceEvent',
              location: `Example Location ${Math.floor(Math.random() * 100)}`,
              raw: 'asdasd',
              systemUptime: 0,
              time: new Date()
            })
          }}
        >
          Simulate ZoneEntrance Event
        </Button>
      </div>

      <Tabs defaultValue="zone-tracking">
        <Tabs.List>
          <Tabs.Trigger value="zone-tracking">Zone Tracking</Tabs.Trigger>
          <Tabs.Trigger value="event-valuation">Valuation Tracking</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="zone-tracking">
          <ZoneTracker />
        </Tabs.Content>
        <Tabs.Content value="event-valuation">
          <EventValuation />
        </Tabs.Content>
      </Tabs>
    </div>
  )
}

export default App
