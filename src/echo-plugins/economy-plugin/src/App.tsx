import { useState } from 'react'
import { context } from './context'
import { Button, Input, Popover, Select, Table, useToast } from 'echo-common/components-v1'

const App = () => {
  const tags = ['Currency', 'Reward Map']
  const [selectedTag, setSelectedTag] = useState('currency')
  const { value: summary } = context().itemGroups.useSummary(selectedTag)

  const sortedSummaries = Object.entries(summary?.summaries ?? {})
  sortedSummaries.sort((a, b) => {
    return b[1]?.sortProperty?.['Affliction'] - a[1]?.sortProperty?.['Affliction']
  })

  return (
    <>
      <div>
        <div>
          <Select
            onValueChange={(e) => {
              setSelectedTag(e.toLowerCase().replace(' ', '_'))
            }}
          >
            <Select.Trigger className="w-[180px]">
              <Select.Value placeholder="Tags" />
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Label>Tags</Select.Label>
                {tags.map((tag) => {
                  return <Select.Item value={tag}>{tag}</Select.Item>
                })}
              </Select.Group>
            </Select.Content>
          </Select>
        </div>
        <div>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head></Table.Head>
                <Table.Head>Name</Table.Head>
                <Table.Head>Hash</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedSummaries.map(([k, v]) => (
                <Table.Row key={k}>
                  <Table.Cell>
                    <img width={48} src={v.icon} />
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col">{v.key && <span>{v.key}</span>}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col">{v.key && <span>{k}</span>}</div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
    </>
  )
}

export default App
