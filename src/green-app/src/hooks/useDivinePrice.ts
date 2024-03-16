import { currentDivinePriceAtom } from '@/components/providers'
import { DEFAULT_VALUATION_INDEX } from '@/lib/constants'
import { listValuations } from '@/lib/http-util'
import { useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { ItemGroupingService } from 'sage-common'

export const useDivinePrice = (league: string | null) => {
  const setDivinePrice = useSetAtom(currentDivinePriceAtom)

  const { data } = useQuery({
    queryKey: ['valuations', league, 'currency'],
    queryFn: () => listValuations(league!, 'currency'),
    gcTime: 20 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    enabled: !!league,
    select: (valuations) => {
      const divineValuationGroup = new ItemGroupingService().withGroup([
        { typeLine: 'Divine Orb' }
      ])[0]
      if (!divineValuationGroup?.group) return 0
      const divineValuation = valuations.valuations[divineValuationGroup.group.primaryGroup.hash]
      const divinePrice = divineValuation.pValues[DEFAULT_VALUATION_INDEX]
      return divinePrice
    }
  })

  useEffect(() => {
    console.log('Set divineprice for ', league, data)
    if (data && league) setDivinePrice(data)
  }, [data, league, setDivinePrice])
}
