import {catchError, concatMap, from, map, mergeMap, Observable, of, Subject, tap, toArray} from "rxjs";
import {PoePartialStashTab, PoeStashTab} from "./poe-api-models";
import {GGG_API_UTIL, HttpUtil} from "./http-util";
import {filterNullish} from "poestack-ts-ratchet";

export class StashApi {


    public stashes$: Subject<PoePartialStashTab[]> = new Subject()
    public stashContent$: Subject<PoeStashTab> = new Subject()

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
                tap((e) => this.stashes$.next(e))
            )
    }

    public getStashContent(league: string, stashId: string): Observable<PoeStashTab> {
        return GGG_API_UTIL.get<{ stash: PoeStashTab }>(`/stash/${league}/${stashId}`)
            .pipe(
                map((e) => e?.stash),
                tap((e) => {
                    e.league = league;
                    e.loadedAtTimestamp = new Date();
                }),
                tap((e) => this.stashContent$.next(e))
            )
    }
}