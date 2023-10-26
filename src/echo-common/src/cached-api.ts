import {
    BehaviorSubject,
    concatMap,
    filter,
    groupBy, map,
    mergeMap,
    Observable,
    of,
    Subject,
    switchMap,
    timer
} from "rxjs";
import {throttleTime} from "rxjs/operators";
import {LOCAL_STORAGE} from "./local-storage-service";
import {filterNullish} from "ts-ratchet";

type CachedValue<T> = { value: T | null; timestamp: number }

export class CachedApi<T> {

    public loadSubject = new Subject<{ key: string }>()
    public dataSubject: BehaviorSubject<{
        [key: string]: CachedValue<T>
    }> = new BehaviorSubject({});


    private lastEventTime = 0;

    constructor(loadFun: (key: string) => Observable<T | null>) {
        this.loadSubject.pipe(
            filter(({key}) => !this.isValid(this.dataSubject.value[key])),
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
        ).subscribe(({key}) => {
                console.log("firing api load", key)
                loadFun(key).subscribe((e) => {
                    this.addToCache(key, e)
                })
            }
        )
    }

    private loadFromLocal(key: string): boolean {
        if (this.dataSubject.value[key]) {
            return false
        }

        const localCachedValue = LOCAL_STORAGE.loadJson<CachedValue<T>>('cache', key);
        if (this.isValid(localCachedValue)) {
            this.dataSubject.next({...this.dataSubject.value, [key]: localCachedValue!!})
            return true
        }
        return false
    }

    private addToCache(key: string, value: T | null) {
        const cachedValue = {value: value, timestamp: Date.now()};
        LOCAL_STORAGE.writeJson(['cache', key], cachedValue)
        this.dataSubject.next({...this.dataSubject.value, [key]: cachedValue})
    }

    private isValid(value: CachedValue<T> | null): boolean {
        return Date.now() - (value?.timestamp ?? 0) < 120_000
    }

    public load(key: string) {
        this.loadSubject.next({key: key})
    }
}