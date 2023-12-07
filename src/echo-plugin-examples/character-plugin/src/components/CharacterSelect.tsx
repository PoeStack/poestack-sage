import { Select } from 'echo-common/components-v1'
import { groupCharactersByLeague } from '../utils/groupCharactersByLeague'
import { PoeCharacter } from 'sage-common'

type CharacterSelectProps = {
  characters: PoeCharacter[]
  onCharacterSelect: (characterName: string) => void
}

export function CharacterSelect({ characters, onCharacterSelect }: CharacterSelectProps) {
  const charactersGroupedByLeague = groupCharactersByLeague(characters)
  return (
    <Select onValueChange={onCharacterSelect}>
      <Select.Trigger>
        <Select.Value placeholder="Select a character" />
      </Select.Trigger>
      <Select.Content>
        {Object.entries(charactersGroupedByLeague).map(([groupName, characters]) => (
          <Select.Group key={groupName}>
            <Select.Label>{groupName}</Select.Label>
            {characters?.map((c) => (
              <Select.Item key={c.id} value={c.name ?? 'unknown'}>
                {c.name}: Lvl {c.level}
              </Select.Item>
            ))}
          </Select.Group>
        ))}
      </Select.Content>
    </Select>
  )
}
