import {catchError, concatMap, from, mergeMap, Observable, of, Subject, tap, toArray} from "rxjs";
import {PoePartialStashTab, PoeStashTab} from "./poe-api-models";
import {HttpUtil} from "./http-util";
import {filterNullish} from "poestack-ts-ratchet";

export class StashApi {

    public stashes$: Subject<PoePartialStashTab[]> = new Subject()
    public stashContent$: Subject<PoeStashTab> = new Subject()

    public getStashes(league: string): Observable<PoePartialStashTab[]> {
        const now = new Date();
        return HttpUtil.get<PoePartialStashTab[]>(`/stash/${league}/stashes`)
            .pipe(
                tap((e) => {
                    e.forEach((t) => {
                        t.league = league;
                    })
                }),
                tap((e) => this.stashes$.next(e))
            )
    }

    public getStashContent(league: string, stashId: string): Observable<PoeStashTab> {
        return HttpUtil.get<PoeStashTab>(`/stash/${league}/stashes/${stashId}`)
            .pipe(
                tap((e) => {
                    e.league = league;
                    e.loadedAtTimestamp = new Date();
                }),
                tap((e) => this.stashContent$.next(e))
            )
    }

    public getStashContents(league: string, stashIds: string[]): Observable<PoeStashTab> {
        return of(stashIds)
            .pipe(
                concatMap((e) => from(e)),
                concatMap((e) =>
                    this.getStashContent(league, e)
                        .pipe(catchError((e, c) => {
                            return of(null)
                        }),)
                ),
                filterNullish(),
            )
    }
}