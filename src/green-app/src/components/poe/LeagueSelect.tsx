import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { listLeagues } from '@/lib/http-util'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { currentUserAtom } from '../providers'
import { useMemo } from 'react'

type OnSelectProps = {
  onSelect: (category: string) => void
}

export function LeagueSelect({ onSelect }: OnSelectProps) {
  const currentUser = useAtomValue(currentUserAtom)

  const { data, isFetching } = useQuery({
    queryKey: ['leagues'],
    queryFn: async () => {
      const leagues = await listLeagues()
      const unsupportedLeagues = ['Path of Exile: Royale']
      const filteredPriceLeagues = leagues.filter(
        (league) =>
          !unsupportedLeagues.includes(league.id) &&
          !league.rules!.some((rule) => rule.id === 'NoParties')
      )
      return filteredPriceLeagues
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!currentUser?.profile?.uuid
  })

  const defaultLeague = useMemo(() => {
    const leagues = data?.filter((x) => x.category?.current)
    const defaultLeague = leagues?.find((x) => x.rules?.length === 0)
    return defaultLeague?.id || leagues?.[0]?.id || undefined
  }, [data])

  return (
    <Select onValueChange={onSelect} defaultValue={defaultLeague} disabled={isFetching}>
      <SelectTrigger>
        <SelectValue placeholder="Select a League" />
      </SelectTrigger>
      <SelectContent>
        {data?.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <div className="flex flex-row gap-2 capitalize">
              <div>{c.id}</div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
