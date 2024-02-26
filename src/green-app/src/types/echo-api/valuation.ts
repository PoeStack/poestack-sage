// Ref: echo-common

export type SageValuationSummaryInternal = {
  k: string
  i: string
}

export type SageValuationInternal = {
  l: number
  c: number[]
  h: number[]
  d: number[]
}

export type SageValuationShardInternal = {
  metadata: SageValuationMetadata
  valuations: { [hash: string]: SageValuationInternal }
}

export type SageValuationMetadata = {
  // divChaosValue: number
  timestampMs: number
  league: string
  tag: string
}

export type SageValuationHistory = {
  primaryValueDaily: number[]
  primaryValueHourly: number[]
}

export type SageValuation = {
  listings: number
  pValues: { [percentile: number]: number }
  primaryValue: number
  history: SageValuationHistory
}

export type SageValuationShard = {
  meta: SageValuationMetadata
  valuations: { [hash: string]: SageValuation }
}
