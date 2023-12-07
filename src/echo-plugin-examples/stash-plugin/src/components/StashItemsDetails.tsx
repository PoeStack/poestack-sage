import { Button, Input, Popover, Table, useToast } from 'echo-common/components-v1'
import { Info } from 'lucide-react'
import { tap, toArray } from 'rxjs'
import { validResults } from 'echo-common'
import { context } from '../context'
import { PoePartialStashTab } from 'sage-common'
import { useEffect, useState } from 'react'

type StashItemsDetailsProps = {
  league: string
  selectedStash: PoePartialStashTab
}

export function StashItemsDetails({ league, selectedStash }: StashItemsDetailsProps) {
  const [searchString, setSearchString] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    context()
      .poeStash.snapshot(league, [selectedStash.id!!])
      .pipe(
        tap((e) => {
          console.log(e)
          if (e.type === 'rate-limit') {
            toast({
              id: `toast-${Date.now()}`,
              title: 'Rate Limit Error',
              description: `${e.type}, ${Date.now() + e.limitExpiresMs}`
            })
          } else if (e.type === 'error') {
            toast({ id: `toast-${Date.now()}`, title: 'Info', description: `${e.type} ${e.error}` })
          }
        }),
        validResults(),
        toArray()
      )
      .subscribe()
  }, [league, selectedStash, toast])

  const stashItems = context()
    .poeStash.usePoeStashItems(league)
    .filter((e) => e.stash?.id === selectedStash.id)
    .filter(
      (e) =>
        !searchString.length || e.data.typeLine?.toLowerCase().includes(searchString.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.stash?.loadedAtTimestamp || 0).getTime() -
        new Date(a.stash?.loadedAtTimestamp || 0).getTime()
    )

  console.log(stashItems)

  return (
    <div className="flex-1 flex flex-col h-full gap-4 pt-4">
      <div className="flex flex-row items-center justify-between">
        <div className="text- mdfont-semibold">{selectedStash?.name}</div>
      </div>
      <div>
        <Input
          type="text"
          placeholder={'Search...'}
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
        />
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head></Table.Head>
            <Table.Head>Name</Table.Head>
            <Table.Head>Value</Table.Head>
            <Table.Head></Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {stashItems.map(({ data: item, group, valuation }) => (
            <Table.Row key={item.id}>
              <Table.Cell>
                <img width={48} src={item.icon} />
              </Table.Cell>
              <Table.Cell>
                <div className="flex flex-col">
                  {item.name && <span>{item.name}</span>}
                  {item.typeLine && <span>{item.typeLine}</span>}
                </div>
              </Table.Cell>
              <Table.Cell>{valuation && `${valuation?.pvs?.[5]} c`}</Table.Cell>
              <Table.Cell>
                <Popover>
                  <Popover.Trigger>
                    <Button size="icon" variant="ghost">
                      <Info className="w-4 h-4" />
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content className="p-2">
                    <ul className="text-sm">
                      {group && (
                        <li className="text-sm">
                          Group: {`${group.tag} ${group.shard} ${group.hash}`}
                        </li>
                      )}
                      {item.properties?.map((p) => {
                        console.log(p)
                        return (
                          <li key={p.name}>
                            {p.name}: {p.values?.join(', ')}
                          </li>
                        )
                      })}
                    </ul>
                  </Popover.Content>
                </Popover>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}
