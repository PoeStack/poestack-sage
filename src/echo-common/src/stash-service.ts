import {BehaviorSubject, filter, from, map, mergeMap, Observable, scan, tap, toArray} from "rxjs";
import {PoeItem, PoePartialStashTab, PoeStashTab, StashApi} from "ggg-api";
import * as fs from "fs";
import path from "path";
import {LOCAL_STORAGE} from "./local-storage-service";
import {CachedApi} from "./cached-api";

export class StashService {
    public stashApi: StashApi

    public currentStashes = new CachedApi<PoePartialStashTab[]>((key) => this.stashApi.getStashes(key))
    public currentStashContents = new CachedApi<PoeStashTab>((key) => this.stashApi.getStashContent(key.split("_")[0], key.split("_")[1]))

    constructor(stashApi: StashApi) {
        console.log("Stash service constructed")
        this.stashApi = stashApi
    }
}

export const STASH_SERVICE = new StashService(new StashApi())
