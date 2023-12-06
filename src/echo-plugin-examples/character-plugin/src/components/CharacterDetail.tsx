import { Skeleton, Table } from 'echo-common/components-v1'
import { context } from '../context'

type CharacterDetailProps = {
  characterName: string
}

export function CharacterDetail({ characterName }: CharacterDetailProps) {
  const { value: character, valueAge } = context().poeCharacters.useCharacter(characterName)

  if (!character) {
    return <Skeleton className="h-[200px]" />
  }

  const characterItems = [
    ...(character.equipment || []),
    ...(character.jewels || []),
    ...(character.inventory || [])
  ]

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex flex-row items-center justify-between">
        <div className="font-semibold">{character?.name}</div>
        <div>{`Lvl: ${character.level} ${character.class} (${character.league})`}</div>
      </div>
      {valueAge && (
        <div className="flex flex-row justify-end">{`Data fetched at: ${new Date(
          Date.now() - (valueAge() ?? 0)
        ).toLocaleString()}`}</div>
      )}
      <Table>
        <Table.Caption>{`${character.name}`}</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.Head></Table.Head>
            <Table.Head>Name</Table.Head>
            <Table.Head>Typeline</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {characterItems.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>
                <img width={48} src={item.icon} />
              </Table.Cell>
              <Table.Cell>{item.name}</Table.Cell>
              <Table.Cell>{item.typeLine}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}
