import {
    combineLatest,
    combineLatestAll,
    concatMap,
    count,
    filter,
    from, interval,
    map, mergeAll,
    mergeMap,
    Observable, of, ReplaySubject, shareReplay, startWith, Subject, take,
    tap
} from 'rxjs';
import fs from "fs";
import Path from "path";
import {PoeApi} from "./poe-api/poe-api";
import {PoeStashTab} from "./poe-api/poe-api-model";
import {takeCoverage} from "v8";


const poeApi = new PoeApi()

interval(5000).subscribe(() => {
    poeApi.loadTab("0dcf95da7a")
})


poeApi.currentStash
    .subscribe(() => {
        poeApi.currentStash
            .pipe(
                take(1),
                mergeMap((e) => Object.values(e.stashTabContents)),
                concatMap((e) => e.items),
                tap((e) => console.log(e)),
                count((e: any) => e.frameType === 3)
            ).subscribe((e) => console.log(e))
    })
