import { Checkbox } from 'echo-common/components-v1'
import { context } from '../context'
import { toggleSelectedStash, useTftConfig } from '../hooks/tft-config'

export function StashList() {
  const { league, selectedStashes } = useTftConfig()
  const { value: stashes } = context().poeStash.useStashes(league)

  return (
    <div>
      {
        stashes?.map((stash) => {
          return (
            <div key={stash.id} className='flex flex-flow gap-2'>
              <Checkbox
                checked={!!selectedStashes.find((s) => s?.id === stash?.id)}
                onClick={() => {toggleSelectedStash(stash)}}
              />
              <div>{stash.name}</div>
            </div>
          )
        })
      }
    </div>
  )
}
