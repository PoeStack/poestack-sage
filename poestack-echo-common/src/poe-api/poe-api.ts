import {BehaviorSubject, concatMap, last, Observable, ReplaySubject, share, Subject, take, tap, timer} from "rxjs";
import fs from "fs";
import Path from "path";
import {PoeStashTab} from "./poe-api-model";

export class PoeApi {

    public currentStash = new BehaviorSubject<{
        stashTabs: PoeStashTab[],
        stashTabContents: Record<any, any>
    }>({stashTabs: [], stashTabContents: {}})

    public stashTabs = new Observable<PoeStashTab[]>((s) => {
        console.log("Loading Stash Tabs")
        fs.readFile(Path.resolve(process.cwd(), "..", `poe-offline-data/stash/run-1/tabs.json`), (e, d) => {
            const tabs = JSON.parse(d.toString());
            s.next(tabs)
            s.complete()
        })
    }).pipe(share({
        connector: () => new ReplaySubject(1),
        resetOnComplete: () => timer(5000),
    }))

    public flatStashTabs = this.stashTabs
        .pipe(
            concatMap((tabs) => tabs),
            concatMap(tab => tab.children ? tab.children : [tab]),
        )

    public loadTab(path: string) {
        this.currentStash
            .pipe(take(1))
            .subscribe((e) => {
                new Observable<any>((s) => {
                    console.log("Loading item data", path)
                    fs.readFile(Path.resolve(process.cwd(), "..", `poe-offline-data/stash/run-1/${path}.json`), (e, d) => {
                        if (d) {
                            s.next(JSON.parse(d.toString()))
                        }
                        s.complete()
                    })
                }).subscribe((tabData) => {
                    e.stashTabContents[path] = tabData
                    this.currentStash.next(e)
                })
            })
    }

}