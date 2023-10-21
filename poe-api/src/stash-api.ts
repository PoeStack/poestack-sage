import {catchError, concatMap, from, mergeMap, Observable, of, Subject, tap, toArray} from "rxjs";
import {PoeApiStashTab} from "./ggg-models";
import {HttpUtil} from "./http-util";
import {filterNullish} from "poestack-ts-ratchet";

export class StashApi {

    public stashes$: Subject<PoeApiStashTab[]> = new Subject()
    public stashContent$: Subject<PoeApiStashTab> = new Subject()

    public getStashes(league: string): Observable<PoeApiStashTab[]> {
        return HttpUtil.get<PoeApiStashTab[]>(`/stash/${league}/stashes`)
            .pipe(
                tap((e) => this.stashes$.next(e))
            )
    }

    public getStashContent(league: string, stashId: string): Observable<PoeApiStashTab> {
        return HttpUtil.get<PoeApiStashTab>(`/stash/${league}/stashes/${stashId}`)
            .pipe(
                tap((e) => this.stashContent$.next(e))
            )
    }

    public getStashContents(league: string, stashIds: string[]): Observable<PoeApiStashTab> {
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