import {map, Observable, tap} from "rxjs";
import {PoeLeague, PoePartialStashTab, PoeProfile, PoeStashTab} from "./poe-api-models";
import {GGG_API_UTIL} from "./http-util";

export class GggApi {

    public getProfile(): Observable<PoeProfile> {
        return GGG_API_UTIL.get<PoeProfile>(`/profile`)
    }

    public getLeagues(): Observable<PoeLeague[]> {
        return GGG_API_UTIL.get<{ leagues: PoeLeague[] }>('/account/leagues').pipe(
            map((e) => e?.leagues)
        )
    }

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