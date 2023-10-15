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

interval(10000).subscribe(() => {
    poeApi.loadTab("0fbced58da")
})

poeApi.stashTabContent$.subscribe((e) => {
    console.log("update ", e.id)
})

poeApi.currentStash.subscribe((e) => console.log("curr", Object.keys(e)))