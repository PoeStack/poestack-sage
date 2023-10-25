import {BehaviorSubject, filter, from, map, mergeMap, Observable, scan, tap, toArray} from "rxjs";
import {PoeItem, PoePartialStashTab, PoeStashTab, StashApi} from "poe-api";
import * as fs from "fs";
import path from "path";
import {LOCAL_STORAGE} from "./local-storage-service";

export class StashService {
    public stashApi: StashApi

    public currentStashes$: BehaviorSubject<Record<string, PoePartialStashTab[]>> =
        new BehaviorSubject<Record<string, PoePartialStashTab[]>>({})
    public currentStashContents$: BehaviorSubject<Record<string, PoeStashTab>> = new BehaviorSubject<Record<string, PoeStashTab>>({})

    constructor(stashApi: StashApi) {
        this.stashApi = stashApi

        this.stashApi.stashes$
            .pipe(
                tap((e) => LOCAL_STORAGE.writeJson(["cache", "stashes", e[0]?.league], e)),
                scan((current: Record<string, PoePartialStashTab[]>, update) => {
                    const next = {...current}
                    const league = update[0]?.league
                    if (league) {
                        next[league] = update
                    }
                    return next
                }, {}),
            ).subscribe(this.currentStashes$)
        this.stashApi.stashContent$
            .pipe(
                tap((e) => LOCAL_STORAGE.writeJson(["cache", "stash-contents", `${e.league}-${e.id}`], e)),
                scan((currentContents: Record<string, PoeStashTab>, newStash) => {
                    return {...currentContents, [newStash.id!]: newStash};
                }, {}),
            ).subscribe(this.currentStashContents$);
    }

    public loadStashes(league: string) {
        if (this.currentStashes$.value[league]) {
            console.log("load from memory")
            return;
        }

        const cachedStashes = LOCAL_STORAGE.loadJson<PoePartialStashTab[]>("cache", "stashes", league)
        if (cachedStashes) {
            console.log("load from disk")
            this.currentStashes$.next({...this.currentStashes$.value, [league]: cachedStashes})
        } else {
            console.log("load from api")
            this.stashApi.getStashes(league).subscribe()
        }
    }

    public loadStashContent(league: string, stashId: string) {
        this.stashApi.getStashContent(league, stashId).subscribe()
    }
}

export const STASH_SERVICE = new StashService(new StashApi())
