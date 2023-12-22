import { Button, Command, Popover } from 'echo-common/components-v1'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { context } from '../context'
import { cn } from 'echo-common'
import { PoePartialStashTab } from 'sage-common'

type StashListProps = {
  league: string
  onChange: (stashes: PoePartialStashTab[]) => void
}

export function StashList({ league, onChange }: StashListProps) {
  const { value: stashes } = context().poeStash.useStashes(league)

  return (
    <div>
      {
        stashes?.map((stash) => {
          return (<div key={stash.id} onClick={() => {onChange([stash])}}>{stash.name}</div>)
        })
      }
    </div>
  )
}
