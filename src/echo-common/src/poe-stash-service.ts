import {PoePartialStashTab, PoeStashTab, GggApi, PoeItem} from "ggg-api";
import {CachedTask} from "./cached-task";
import {bind} from "@react-rxjs/core";
import {filter, from, map, mergeMap, toArray} from "rxjs";
import {filterNullish} from "ts-ratchet";

export class PoeStashService {
    public gggApi: GggApi

    public currentStashes = new CachedTask<PoePartialStashTab[]>((key) => this.gggApi.getStashes(key))
    public currentStashContents = new CachedTask<PoeStashTab>((key) => this.gggApi.getStashContent(key.split("_")[0], key.split("_")[1]))

    constructor(stashApi: GggApi) {
        this.gggApi = stashApi
    }
}

export const POE_STASH_SERVICE = new PoeStashService(new GggApi())

export type EchoPoeItem = {
    stash: PoePartialStashTab & { items?: PoeItem[] | undefined, loadedAtTimestamp: string },
    data: PoeItem
}

export const [usePoeStashes] = bind((league: string) => POE_STASH_SERVICE.currentStashes.cache$
    .pipe(
        map((e) => e[league]),
        map((e) => (e?.result ?? []).flatMap((t) => t.children ?? [t]))
    ), [])

export const [usePoeStashItems] = bind((league: string) => POE_STASH_SERVICE.currentStashContents.cache$
    .pipe(
        mergeMap((tabs) =>
            from(Object.values(tabs).map((e) => e.result)).pipe(
                filterNullish(),
                filter((e) => e.league === league),
                mergeMap((stash) => (stash?.items ?? []).map((item) => ({stash, data: item}))),
                toArray<EchoPoeItem>(),
            ))
    ), [])

