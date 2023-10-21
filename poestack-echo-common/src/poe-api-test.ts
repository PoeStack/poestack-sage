import {StashApi} from "poe-api";
import {from, mergeMap} from "rxjs";



const stashApi = new StashApi();
stashApi.stashTabs$
    .pipe(
        mergeMap((e) => from(e))
    )
    .subscribe((e) => console.log("tabs got", e.id))
stashApi.load().subscribe()