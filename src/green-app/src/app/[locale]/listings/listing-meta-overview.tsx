'use client'

import CurrencyDisplay from '@/components/currency-display'
import { Label } from '@/components/ui/label'
import { SageListingType } from '@/types/sage-listing-type'
import { t } from 'i18next'
import { LayoutListIcon, PackageIcon } from 'lucide-react'
import Image from 'next/image'
import { useMemo } from 'react'

type ListingMetaOverviewProps = {
  selectedListing: SageListingType
}

export default function ListingMetaOverview({ selectedListing }: ListingMetaOverviewProps) {
  const multiplier = useMemo(() => {
    if (selectedListing.meta.multiplier === -1) return '- '
    return selectedListing.meta.multiplier.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  }, [selectedListing.meta.multiplier])

  return (
    <>
      <div className="grid grid-cols-6 w-fit gap-1 text-sm gap-x-3 h-fit">
        <Label className="text-sm">{t('label.seller')}</Label>
        <div className="col-span-5">{selectedListing.meta.ign}</div>
        <Label className="text-sm">{t('label.category')}</Label>
        <div className="col-span-5 flex flex-row gap-1 items-center">
          <Image
            className="max-w-5 max-h-5 shrink-0"
            src={selectedListing.meta.icon}
            width={20}
            height={20}
            alt={selectedListing.meta.altIcon}
          />
          <div>{t(`categories.${selectedListing.meta.category}` as any)}</div>
        </div>
        <Label className="text-sm">{t('label.sellMode')}</Label>
        <div className="col-span-5 flex flex-row gap-1 items-center">
          {selectedListing.meta.listingMode === 'bulk' ? (
            <>
              <PackageIcon className="w-4 h-4" />
              {t('label.wholeListingShort')}
            </>
          ) : (
            <>
              <LayoutListIcon className="w-4 h-4" />
              {t('label.individualListingShort')}
            </>
          )}
        </div>
        <Label className="text-sm">{t('label.askingPrice')}</Label>
        <div className="col-span-5">
          <div className="w-fit">
            <CurrencyDisplay value={selectedListing.meta.calculatedTotalPrice} />
          </div>
        </div>
        <Label className="text-sm">{t('label.multiplierLabel')}</Label>
        <div className="col-span-5">{multiplier}%</div>
      </div>
    </>
  )
}
