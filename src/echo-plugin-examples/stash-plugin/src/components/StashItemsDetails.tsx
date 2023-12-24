import { Button, Input, Popover, Table, useToast } from 'echo-common/components-v1'
import { Info } from 'lucide-react'
import { PoePartialStashTab } from 'sage-common'
import { useState } from 'react'
import { context } from '../context'
import { mergeMap, toArray } from 'rxjs'
import { bind } from '@react-rxjs/core'
import { validResults } from 'echo-common'

type StashItemsDetailsProps = {
  league: string
  selectedStash: PoePartialStashTab
}

const [useStashItems] = bind(
  (league: string, stash: string) =>
    context()
      .poeStash.stashTab(league, stash)
      .pipe(
        validResults(),
        mergeMap((r) => context().poeValuations.withValuationsResultOnly(league, r?.items ?? [])),
        toArray()
      ),
  null
)

export function StashItemsDetails({ league, selectedStash }: StashItemsDetailsProps) {
  const [searchString, setSearchString] = useState('')
  const { toast } = useToast()

  const items = useStashItems(league, selectedStash.id ?? '')

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
          {items?.map((item) => (
            <Table.Row key={item.data.id}>
              <Table.Cell>
                <img width={48} src={item.data.icon} />
              </Table.Cell>
              <Table.Cell>
                <div className="flex flex-col">
                  {item.data.name && <span>{item.data.name}</span>}
                  {item.data.typeLine && <span>{item.data.typeLine}</span>}
                </div>
              </Table.Cell>
              <Table.Cell>{item.valuation && `${item.valuation?.primaryValue} c`}</Table.Cell>
              <Table.Cell>
                <Popover>
                  <Popover.Trigger>
                    <Button size="icon" variant="ghost">
                      <Info className="w-4 h-4" />
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content className="p-2">
                    <ul className="text-sm">
                      {item.group && (
                        <li className="text-sm">Group: {`${item.group?.primaryGroup?.tag} ${item.group?.primaryGroup?.hash}`}</li>
                      )}
                      {item.group?.primaryGroup?.unsafeHashProperties.properties?.map((p: any) => {
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
