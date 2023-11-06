import { CachedTask } from './cached-task'
import { HttpUtil } from 'sage-common'

export class SageValuationService {
  private httpUtil = new HttpUtil()

  public currentStashes = new CachedTask<SageValuationShard>((key) => this.loadInternal(key))

  public load(tag: string, shard: number | string, league: string) {
    this.currentStashes.load(`${tag}_${shard}_${league}`.replaceAll(' ', '_')).subscribe()
  }

  private loadInternal(key: string) {
    return this.httpUtil.get<SageValuationShard>(
      `https://d2irw5qsw9zuri.cloudfront.net/v3/${key}.json`
    )
  }
}

export const SAGE_VALUATION_SERVICE = new SageValuationService()

export type SageValuation = {
  l: number
  pvs: number[]
}

export type SageValuationShard = {
  timestampMs: number
  valuations: { [hash: string]: SageValuation }
}
