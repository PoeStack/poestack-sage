import {BehaviorSubject, concatMap, last, Observable, ReplaySubject, share, Subject, take, tap, timer} from "rxjs";
import fs from "fs";
import Path from "path";
import {PoeStashTab} from "./poe-api-model";

export class PoeApi {

    public stashTabContent$: Subject<any>;
    public currentStash: BehaviorSubject<any>

    constructor() {
        console.log("poe api construct")
        this.stashTabContent$ = new Subject<any>()
        this.currentStash = new BehaviorSubject({})
        this.stashTabContent$.subscribe((stashUpdate) => {
            const nextStash: any = {...this.currentStash.value}
            nextStash[stashUpdate.id] = stashUpdate
            this.currentStash.next(nextStash);
        })
    }

    public loadTab(path: string) {
        new Observable<any>((s) => {
            console.log("Loading item data", path)
            fs.readFile(Path.resolve(process.cwd(), "..", `poe-offline-data/stash/run-1/${path}.json`), (e, d) => {
                if (d) {
                    s.next(JSON.parse(d.toString()))
                }
                s.complete()
            })
        }).subscribe((e) => this.stashTabContent$.next(e))
    }
}