// Ref: echo-common

export type SageItemGroupSummary = {
  hash: string
  key: string
  icon: string
  unsafeHashProperties: { [key: string]: any }
  sortProperty: { [league: string]: number }

  // Injected/Mapped
  displayName: string
  tag?: string
}

export type SageItemGroupSummaryShard = {
  meta: { tag?: string }
  summaries: { [itemGroupHashString: string]: SageItemGroupSummary }
}

export type SageItemGroupSummaryInternal = {
  k: string
  i: string
  p: { [key: string]: any }
  v: { [league: string]: number }
}

export type SageItemGroupSummaryShardInternal = {
  meta: { tag?: string }
  summaries: { [itemGroupHashString: string]: SageItemGroupSummaryInternal }
}
