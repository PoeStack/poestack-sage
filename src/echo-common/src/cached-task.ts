import { BehaviorSubject, filter, groupBy, map, mergeMap, Observable, Subject, take } from 'rxjs'
import { throttleTime } from 'rxjs/operators'
import { filterNullish } from 'ts-ratchet'
import { EchoDirService } from './echo-dir-service'

export type SharedCacheLoadMode = "Default" | "CacheOnly" | "NoCache"

export type SharedCacheLoadConfig = {
  key: string,
  source: string,
  mode?: SharedCacheLoadMode
}

export type SharedCacheResultEvent<T> = {
  type: "result",
  key: string,
  result: T | null | undefined,
  timestampMs: number
}

export type SharedCacheEvent<T> = SharedCacheResultEvent<T>

export type SharedCacheLoadEvent = {
  key: string
}

export class SharedCache<T> {
  private tasks$ = new Subject<SharedCacheLoadEvent>()
  private events$ = new Subject<SharedCacheEvent<T>>()

  private cache$ = new BehaviorSubject<{ [key: string]: SharedCacheEvent<T> }>({})
  private localCache: { [key: string]: boolean } = {}

  constructor(
    private dir: EchoDirService,
    loadFun: (key: string) => Observable<T | null>
  ) {
    this.tasks$
      .pipe(
        map((event) => this.loadFromLocalIfValid(event)),
        filterNullish(),
        groupBy((item) => item.key),
        mergeMap((group) => group.pipe(throttleTime(60000))),
        map((event) => this.loadFromLocalIfValid(event)),
        filterNullish()
      )
      .subscribe((e) => {
        loadFun(e.key)
          .pipe(take(1))
          .subscribe((r) => {
            const finalEvent: SharedCacheEvent<T> = {
              type: "result",
              key: e.key,
              result: r,
              timestampMs: Date.now()
            }
            this.addToCache(finalEvent)
            this.events$.next(finalEvent)
          })
      })
  }

  private loadFromLocalIfValid(event: SharedCacheLoadEvent): SharedCacheLoadEvent | null {
    const key = event.key
    const memoryCachedResult = this.cache$.value[key]
    if (memoryCachedResult && this.isValid(memoryCachedResult)) {
      this.events$.next(memoryCachedResult)
      return null
    }

    if (!this.localCache[key]) {
      this.localCache[key] = true
      if (this.dir.existsJson('cache', key)) {
        const localCachedValue = this.dir.loadJson<SharedCacheEvent<T>>('cache', key)
        if (localCachedValue && this.isValid(localCachedValue)) {
          this.cache$.next({ ...this.cache$.value, [key]: localCachedValue })
          this.events$.next(localCachedValue)
          return null
        }
      }
    }

    return event
  }

  private addToCache(event: SharedCacheEvent<T>) {
    this.dir.writeJson(['cache', event.key], event)
    this.cache$.next({ ...this.cache$.value, [event.key]: event })
  }

  private isValid(value: SharedCacheEvent<T> | null): boolean {
    return Date.now() - (value?.timestampMs ?? 0) < 120_000
  }

  public load(config: SharedCacheLoadConfig): Observable<SharedCacheEvent<T>> {
    return new Observable<SharedCacheEvent<T>>((sub) => {
      const eventSub = this.events$.pipe(filter((e) => e.key === config.key)).subscribe((e) => {
        sub.next(e)

        if (e.type === "result") {
          sub.complete()
          eventSub.unsubscribe()
        }
      })

      this.tasks$.next({ key: config.key })
    })
  }
}
