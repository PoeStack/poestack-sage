import {CachedTask} from "./cached-task";
import {PoePartialStashTab} from "sage-common";
import {HTTP_UTIL} from "./http-util";

export class SageValuationService {
    public currentStashes = new CachedTask<SageValuationShard>((key) => this.loadInternal(key))

    public load(tag: string, shard: number | string, league: string) {
        this.currentStashes.load(`${tag}_${shard}_${league}`.replaceAll(" ", "_")).subscribe()
    }

    private loadInternal(key: string) {
        return HTTP_UTIL.get<SageValuationShard>(`https://d2irw5qsw9zuri.cloudfront.net/v3/${key}.json`)
    }
}

export const SAGE_VALUATION_SERVICE = new SageValuationService()

export type SageValuation = {
    l: number,
    pvs: number[]
}

export type SageValuationShard = {
    timestampMs: number,
    valuations: { [hash: string]: SageValuation }
}