import { Select } from 'echo-common/components-v1'

type LeagueSelectProps = {
  onLeagueSelect: (characterName: string) => void
}

export function LeagueSelect({ onLeagueSelect }: LeagueSelectProps) {
  const leagues = ['Affliction', 'Standard']
  return (
    <Select onValueChange={onLeagueSelect}>
      <Select.Trigger>
        <Select.Value placeholder="Select a league" />
      </Select.Trigger>
      <Select.Content>
        {leagues?.map((league) => (
          <Select.Item key={league} value={league}>
            {league}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  )
}
