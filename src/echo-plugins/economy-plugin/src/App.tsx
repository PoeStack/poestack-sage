import { useState } from 'react'
import { context } from './context'
import { Select, Table } from 'echo-common/components-v1'
import { bind } from '@react-rxjs/core'
import { validResults } from 'echo-common'
import { forkJoin, from, map, mergeMap, of, toArray } from 'rxjs'

const [useSummaries, summaries$] = bind(
  (league: string, tag: string) =>
    context()
      .itemGroups.summary(tag)
      .pipe(
        validResults(),
        mergeMap((s) => from(Object.values(s.summaries))),
        mergeMap((s) => {
          return forkJoin({
            summary: of(s),
            valuation: context()
              .poeValuations.valuationRaw(league, tag)
              .pipe(
                validResults(),
                map((e) => e?.valuations?.[s.hash])
              )
          })
        }),
        toArray()
      ),
  null
)

const App = () => {
  const tags = [
    'forbidden_tome',
    'fragment',
    'currency',
    'card',
    'misc',
    'atlas_memory',
    'breach',
    'gem',
    'essence',
    'delirium_orb',
    'oil',
    'vial',
    'unique',
    'timeless_jewel',
    'inscribed_ultimatum',
    'incubator',
    'resonator',
    'reward_map',
    'compass',
    'scouting_report',
    'beast',
    'map',
    'contract',
    'cluster',
    'catalyst',
    'artifacts',
    'relic',
    'logbook',
    'scarab',
    'tattoo',
    'fossil',
    'invitation'
  ]
  const [selectedTag, setSelectedTag] = useState('currency')
  const summaries = useSummaries('Affliction', selectedTag)

  summaries?.sort((a, b) => {
    return (b.valuation?.primaryValue ?? 0) - (a.valuation?.primaryValue ?? 0)
  })
  const results = summaries?.slice(0, 100)

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
                  return (
                    <Select.Item key={tag} value={tag}>
                      {tag}
                    </Select.Item>
                  )
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
                <Table.Head>Value (C)</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {results?.map((s) => (
                <Table.Row key={s.summary.hash}>
                  <Table.Cell>
                    <img width={48} src={s.summary.icon} />
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col">
                      {s.summary.key && <span>{s.summary.key}</span>}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col">
                      {s.summary.hash && <span>{s.summary.hash}</span>}
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex flex-col">
                      {s.valuation?.primaryValue && <span>{s.valuation.primaryValue}</span>}
                    </div>
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
