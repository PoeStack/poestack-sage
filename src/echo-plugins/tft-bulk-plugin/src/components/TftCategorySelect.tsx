import { Select } from 'echo-common/components-v1'
import { TFT_CATEGORIES } from '../utils/tft-categories'

type LeagueSelectProps = {
  onSelect: (characterName: string) => void
}

export function TftCategorySelect({ onSelect }: LeagueSelectProps) {
  const tftCategories = Object.values(TFT_CATEGORIES)
  return (
    <Select onValueChange={onSelect}>
      <Select.Trigger>
        <Select.Value placeholder="Select a league" />
      </Select.Trigger>
      <Select.Content>
        {tftCategories?.map((league) => (
          <Select.Item key={league.name} value={league.name}>
            <div className='flex flex-row gap-2'>
              <img width={24} src={league.icon} />
              <div>
                {league.name}
              </div>
            </div>
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  )
}
