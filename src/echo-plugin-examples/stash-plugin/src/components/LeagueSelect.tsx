import { Select } from 'echo-common/components-v1'
import { context } from '../context'

type LeagueSelectProps = {
  onLeagueSelect: (characterName: string) => void
}

export function LeagueSelect({ onLeagueSelect }: LeagueSelectProps) {
  const leagues = context().poeAccounts.useLeagues().value ?? []
  return (
    <Select onValueChange={onLeagueSelect}>
      <Select.Trigger>
        <Select.Value placeholder="Select a league" />
      </Select.Trigger>
      <Select.Content>
        {leagues.map((league) => (
          <Select.Item key={league.id} value={league.id}>
            {league.id}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  )
}
