import { BehaviorSubject } from "rxjs";
import { bind } from '@react-rxjs/core'
import { PoePartialStashTab } from "sage-common";
import { TftCategory } from "../utils/tft-categories";

export type TftConfigType = {
  league: string,
  selectedStashes: PoePartialStashTab[],
  selectedTftCategory: TftCategory | null,
}

const DEFAULT: TftConfigType = {
  league: "Affliction",
  selectedStashes: [],
  selectedTftCategory: null
}

export const TFT_CONFIG = new BehaviorSubject(DEFAULT)

export const setLeague = (league: string) => {
  TFT_CONFIG.next({ ...TFT_CONFIG.value, league: league })
}

export const setSelectedTftCategory = (category: TftCategory) => {
  TFT_CONFIG.next({ ...TFT_CONFIG.value, selectedTftCategory: category })
}

export const toggleSelectedStash = (stash: PoePartialStashTab) => {
  const curr = TFT_CONFIG.value.selectedStashes
  if (curr.find((e) => e?.id === stash?.id)) {
    TFT_CONFIG.next({ ...TFT_CONFIG.value, selectedStashes: curr.filter((e) => e.id !== stash.id) })
  } else {
    TFT_CONFIG.next({ ...TFT_CONFIG.value, selectedStashes: [...curr, stash] })
  }

}

export const [useTftConfig] = bind(TFT_CONFIG, DEFAULT)
