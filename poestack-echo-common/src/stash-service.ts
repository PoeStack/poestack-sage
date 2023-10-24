import {BehaviorSubject, filter, from, map, mergeMap, Observable, scan, tap, toArray} from "rxjs";
import {PoeItem, PoePartialStashTab, PoeStashTab, StashApi} from "poe-api";

export class StashService {
    public stashApi: StashApi

    public currentStashes$: BehaviorSubject<PoePartialStashTab[]> = new BehaviorSubject<PoePartialStashTab[]>([])
    public currentStashContents$: BehaviorSubject<PoeStashTab[]> = new BehaviorSubject<PoeStashTab[]>([])

    constructor(stashApi: StashApi) {
        this.stashApi = stashApi
        this.stashApi.stashes$.subscribe(this.currentStashes$)
        this.stashApi.stashContent$
            .pipe(
                scan((currentContents: PoeStashTab[], newStash) => {
                    const updatedContents = currentContents.filter(item => item.id !== newStash.id);
                    updatedContents.push(newStash);
                    return updatedContents;
                }, [])
            )
            .subscribe(this.currentStashContents$);
    }
}

export const STASH_SERVICE = new StashService(new StashApi())
