import {
    BehaviorSubject,
    concatMap,
    filter,
    groupBy,
    map,
    mergeMap,
    Observable,
    of,
    Subject,
    switchMap,
    take,
    timer
} from "rxjs";
import {throttleTime} from "rxjs/operators";
import {filterNullish} from "ts-ratchet";
import {ECHO_DIR} from "./echo-dir-service";


export type CachedTaskEvent<T> = {
    key: string,
    state?: string,
    status?: string,
    result?: T | null | undefined,
    timestampMs?: number
}

export class CachedTask<T> {

    private tasks$ = new Subject<CachedTaskEvent<T>>()
    public events$ = new Subject<CachedTaskEvent<T>>()
    public cache$ = new BehaviorSubject<{ [key: string]: CachedTaskEvent<T> }>({})

    private lastEventTime = 0

    constructor(loadFun: (key: string) => Observable<T | null>) {
        this.tasks$.pipe(filter(({key}) => !this.isValid(this.cache$.value[key])),
            groupBy(item => item.key),
            mergeMap(group => group.pipe(throttleTime(10000))),
            map((e) => this.loadFromLocal(e.key) ? null : e),
            filterNullish(),
            switchMap(event => {
                const currentTime = Date.now();
                const timeSinceLastEvent = currentTime - this.lastEventTime;

                if (timeSinceLastEvent >= 2000) {
                    this.lastEventTime = currentTime;
                    return of(event);
                } else {
                    this.lastEventTime = this.lastEventTime + 2000;
                    const delayTime = this.lastEventTime - currentTime;
                    return timer(delayTime).pipe(concatMap(() => of(event)));
                }
            }),
        ).subscribe((e) => {
                loadFun(e.key).pipe(
                    take(1)
                ).subscribe((r) => {
                    const finalEvent: CachedTaskEvent<T> = {
                        key: e.key,
                        state: "complete",
                        result: r,
                        timestampMs: Date.now()
                    }
                    this.events$.next(finalEvent)
                    this.addToCache(finalEvent)
                })
            }
        )
    }

    private loadFromLocal(key: string): boolean {
        if (this.cache$.value[key]) {
            return false
        }

        const localCachedValue = ECHO_DIR.loadJson<CachedTaskEvent<T>>('cache', key);
        if (this.isValid(localCachedValue)) {
            this.cache$.next({...this.cache$.value, [key]: localCachedValue!!})
            return true
        }
        return false
    }

    private addToCache(event: CachedTaskEvent<T>) {
        ECHO_DIR.writeJson(['cache', event.key], event)
        this.cache$.next({...this.cache$.value, [event.key]: event})
    }

    private isValid(value: CachedTaskEvent<T> | null): boolean {
        return Date.now() - (value?.timestampMs ?? 0) < 120_000
    }

    public load(key: string): Observable<CachedTaskEvent<T>> {
        console.log("loading", key)
        return new Observable<CachedTaskEvent<T>>((sub) => {
            const eventSub = this.events$.pipe(
                filter((e) => e.key === key),
            ).subscribe((e) => {
                sub.next(e)

                if (e.state === 'complete') {
                    sub.complete()
                    eventSub.unsubscribe()
                }
            })

            this.tasks$.next({key: key})
        });
    }
}