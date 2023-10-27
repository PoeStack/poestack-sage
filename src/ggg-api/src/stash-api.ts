import {map, Observable, tap} from "rxjs";
import {PoePartialStashTab, PoeStashTab} from "./poe-api-models";
import {GGG_API_UTIL} from "./http-util";

export class StashApi {

    public getStashes(league: string): Observable<PoePartialStashTab[]> {
        return GGG_API_UTIL.get<{ stashes: PoePartialStashTab[] }>(`/stash/${league}`)
            .pipe(
                map((e) => e.stashes),
                tap((e) => {
                    e.forEach((t) => {
                        t.children?.forEach((c) => c.league = league)
                        t.league = league;
                    })
                }),
            )
    }

    public getStashContent(league: string, stashId: string): Observable<PoeStashTab> {
        return GGG_API_UTIL.get<{ stash: PoeStashTab }>(`/stash/${league}/${stashId}`)
            .pipe(
                map((e) => e?.stash),
                tap((e) => {
                    e.league = league;
                    e.loadedAtTimestamp = new Date().toString();
                }),
            )
    }
}