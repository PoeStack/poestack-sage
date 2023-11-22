import { SmartCache } from './smart-cache'
import { HttpUtil, SageItemGroup } from 'sage-common'
import { EchoDirService } from './echo-dir-service'

export class SageValuationService {
  private httpUtil = new HttpUtil()

  constructor(private echoDir: EchoDirService) { }

  public cacheValuationShards = new SmartCache<SageValuationShard>(this.echoDir, "sage-valuations")

  public valuation(league: string, group: SageItemGroup) {
    const key = `${group.tag}_${group.shard}_${league}`.replaceAll(' ', '_')
    return this.cacheValuationShards
      .load(
        { key: key },
        () => this.loadInternal(key)
      )
  }

  private loadInternal(key: string) {
    return this.httpUtil.get<SageValuationShard>(
      `https://d2irw5qsw9zuri.cloudfront.net/v3/${key}.json`
    )
  }
}

export type SageValuation = {
  l: number
  pvs: number[]
}

export type SageValuationShard = {
  timestampMs: number
  valuations: { [hash: string]: SageValuation }
}
