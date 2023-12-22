import { EchoPoeItem } from 'echo-common'
import { Button, Input, Popover, Table, useToast } from 'echo-common/components-v1'
import { PoePartialStashTab } from 'sage-common'

type StashItemsDetailsProps = {
  items: EchoPoeItem[]
}

export function StashItemsDetails({ items }: StashItemsDetailsProps) {
  return (
    <div className="flex-1 flex flex-col h-full gap-4 pt-4">
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
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}
