import { setSelectedStashes, setSelectedTftCategory, useTftConfig } from "../hooks/tft-config"
import { StashList } from "./StashList"
import { TftCategorySelect } from "./TftCategorySelect"
import { TFT_CATEGORIES } from "../utils/tft-categories"
import { useTftFilteredItems } from "../hooks/tft-items"
import { postListing } from "../hooks/tft-actions"

export function ControlPanel() {
  const { league } = useTftConfig()
  const items = useTftFilteredItems()

  return (
    <div className='flex flex-col'>
      <StashList />
      <div>
        <TftCategorySelect onSelect={(c) => { setSelectedTftCategory(TFT_CATEGORIES.find((cat) => cat.name === c)!!) }} />
        <div>
          Total value: {items.reduce((p, c) => p + ((c.valuation?.primaryValue ?? 0) * c.totalQuantity), 0)}
        </div>
        <div onClick={() => {postListing()}}>Post Message</div>
      </div>
    </div>
  )
}
