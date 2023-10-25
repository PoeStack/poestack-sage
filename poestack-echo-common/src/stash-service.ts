import {BehaviorSubject, filter, from, map, mergeMap, Observable, scan, tap, toArray} from "rxjs";
import {PoeItem, PoePartialStashTab, PoeStashTab, StashApi} from "poe-api";
import * as fs from "fs";
import path from "path";

export class StashService {
    public stashApi: StashApi

    public currentStashes$: BehaviorSubject<Record<string, PoePartialStashTab[]>> = new BehaviorSubject<Record<string, PoePartialStashTab[]>>({})
    public currentStashContents$: BehaviorSubject<Record<string, PoeStashTab>> = new BehaviorSubject<Record<string, PoeStashTab>>({})

    constructor(stashApi: StashApi) {
        this.stashApi = stashApi

        const stashesCache = path.resolve("test.json");
        if (fs.existsSync(stashesCache)) {
            this.currentStashes$.next(JSON.parse(fs.readFileSync(stashesCache).toString())
            )
        }

        this.stashApi.stashes$
            .pipe(
                scan((current: Record<string, PoePartialStashTab[]>, update) => {
                    const next = {...current}
                    const league = update[0]?.league
                    if (league) {
                        next[league] = update
                    }
                    return next
                }, {}),
                tap((e) => fs.writeFileSync(path.resolve("test.json"), JSON.stringify(e)))
            ).subscribe(this.currentStashes$)
        this.stashApi.stashContent$
            .pipe(
                scan((currentContents: Record<string, PoeStashTab>, newStash) => {
                    return {...currentContents, [newStash.id!]: newStash};
                }, {}),
            ).subscribe(this.currentStashContents$);
    }
}

export const STASH_SERVICE = new StashService(new StashApi())
