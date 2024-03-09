import CurrencyDisplay from '@/components/currency-display'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ListingMode } from '@/types/sage-listing-type'
import { LayoutListIcon, PackageIcon, RefreshCwIcon } from 'lucide-react'
import { useListingToolStore } from './listingToolStore'

type ListingCardProps = {
  listingMode: ListingMode
  selectedCategory: string | null
  selectedSubCategory: string | null
  postListingButtonDisabled: boolean
  isPostListingLoading: boolean
  onListingModeChange: (listingMode: ListingMode, category?: string | null) => void
  onPostItemsClicked: () => void
}

export function ListingCard({
  listingMode,
  selectedCategory,
  selectedSubCategory,
  postListingButtonDisabled,
  isPostListingLoading,
  onListingModeChange,
  onPostItemsClicked
}: ListingCardProps) {
  const setMultiplier = useListingToolStore((state) => state.setLocalMultiplier)
  const multiplier = useListingToolStore((state) => state.localMultiplier)
  const totalPrice = useListingToolStore((state) => state.totalPrice)

  return (
    <div className="border bg-card text-card-foreground shadow flex flex-col px-2 py-4 gap-4 rounded-md">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex flex-row items-center gap-2 cursor-pointer"
              onClick={() => onListingModeChange(listingMode === 'bulk' ? 'single' : 'bulk')}
            >
              <Switch
                checked={listingMode === 'bulk'}
                onCheckedChange={(checked) => onListingModeChange(checked ? 'bulk' : 'single')}
              />
              <Label className="flex flex-row gap-1 cursor-pointer select-none items-center">
                {listingMode === 'bulk' ? (
                  <>
                    <PackageIcon className="w-4 h-4" />
                    {'Whole Offering '}
                  </>
                ) : (
                  <>
                    <LayoutListIcon className="w-4 h-4" />
                    {'Individual Priced Items '}
                  </>
                )}

                {/* <div className="flex flex-row">
                  {'('}
                  <span className="flex flex-row gap-1">
                    <PackageIcon className="w-4 h-4" />
                    {' | '}
                    <LayoutListIcon className="w-4 h-4" />
                  </span>
                  {')'}
                </div> */}
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col text-sm">
              <div className="flex flex-row gap-2 items-center">
                <PackageIcon className="w-4 h-4" /> Whole offering: Sell the whole offering at once
              </div>
              <div className="flex flex-row gap-2 items-center">
                <LayoutListIcon className="w-4 h-4" /> Individual: Sell individual priced items
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Label>Multiplier: {multiplier}%</Label>
      <Slider
        min={0}
        value={[multiplier]}
        max={200}
        step={2.5}
        onValueChange={(e) => {
          setMultiplier(e[0], selectedCategory + (selectedSubCategory || ''))
        }}
      />
      <div className="flex items-center gap-2">
        <Label>Total Value: </Label>
        <CurrencyDisplay iconRect={{ width: 24, height: 24 }} value={totalPrice} />
      </div>

      <Button
        variant="default"
        onClick={onPostItemsClicked}
        disabled={
          postListingButtonDisabled || isPostListingLoading || totalPrice === 0 || multiplier === 0
        }
        className="flex flex-row gap-2"
      >
        Post Offering
        <RefreshCwIcon className={cn(isPostListingLoading && 'animate-spin', 'w-4 h-w')} />
      </Button>
    </div>
  )
}
