import { Subject, debounce, mergeMap } from "rxjs";
import { TFT_CONFIG } from "./tft-config";
import { TftCategory } from "../utils/tft-categories";
import { TFT_FILTERED_ITEMS } from "./tft-items";

export type TftPostListingRequest = {
  timestamp: number,
  league: string,
  selectedTftCategory: TftCategory,
  items: { group: string, quantity: number }[]
}

export const POST_LISTING = new Subject<TftPostListingRequest>()

POST_LISTING.pipe(

).subscribe((p) => {
  console.log("posting", p)
})

export const postListing = () => {
  const { league, selectedTftCategory } = TFT_CONFIG.value
  const items = TFT_FILTERED_ITEMS.value

  const posting: TftPostListingRequest = {
    timestamp: Date.now(),
    league: league,
    selectedTftCategory: selectedTftCategory!!,
    items: items.map((e) => ({
      group: e.group?.primaryGroup.hash!!,
      quantity: e.totalQuantity ?? 0
    }))
  }

  POST_LISTING.next(posting)
}
