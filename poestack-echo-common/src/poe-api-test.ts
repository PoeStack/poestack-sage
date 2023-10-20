import {PoeLogEventsApi} from "./poe-api/poe-log-events-api";
import {bufferCount, filter, interval, shareReplay, take, tap, toArray} from "rxjs";


const poeLogApi = new PoeLogEventsApi()
poeLogApi.startTestEvents()


const replayAble = poeLogApi
    .logEvents$
    .pipe(
        shareReplay(1),
    )


replayAble.subscribe((e) => {
    console.log("a2", e)
})

replayAble.subscribe((e) => {
    console.log("a1", e)
})



interval()

replayAble
    .pipe(
        bufferCount(5)
    )
    .subscribe((e) => console.log("aaa", e))