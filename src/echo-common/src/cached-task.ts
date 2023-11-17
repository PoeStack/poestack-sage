import { BehaviorSubject, filter, groupBy, map, mergeMap, Observable, Subject, take } from 'rxjs'
import { throttleTime } from 'rxjs/operators'
import { filterNullish } from 'ts-ratchet'
import { EchoDirService } from './echo-dir-service'

export type SmartCacheLoadMode = "Default" | "CacheOnly" | "NoCache"

export type SmartCacheLoadConfig = {
  key: string,
  source: string,
  mode?: SmartCacheLoadMode
}

export type SmartCacheResultEvent<T> = {
  type: "result",
  key: string,
  result: T | null | undefined,
  timestampMs: number
}

export type SmartCacheEvent<T> = SmartCacheResultEvent<T>

export type SmartCacheLoadEvent = {
  key: string
}

export class SmartCache<T> {
  private taskQueue$ = new Subject<SmartCacheLoadEvent>()
  private events$ = new Subject<SmartCacheEvent<T>>()

  //What if there was on BehaviorSubject per key that contained the state {loading, error, data}

  private cache$ = new BehaviorSubject<{ [key: string]: SmartCacheEvent<T> }>({})
  private localCacheChecked: { [key: string]: boolean } = {}

  constructor(
    private dir: EchoDirService,
    loadFun: (key: string) => Observable<T | null>
  ) {
    this.taskQueue$
      .pipe(
        map((event) => this.loadFromLocalIfValid(event)),
        filterNullish(),
        groupBy((item) => item.key),
        mergeMap((group) => group.pipe(throttleTime(60000))), //can this be concat map
        map((event) => this.loadFromLocalIfValid(event)),
        filterNullish()
        //if that is concat add rate limit here, maybe put it at the start of a seperate subject for exeuction, so some events can jump the line
        //not sure if that works for throttle bypass tho actually
      )
      .subscribe((e) => {
        loadFun(e.key)
          .pipe(take(1))
          .subscribe((r) => {
            const finalEvent: SmartCacheEvent<T> = {
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

  private loadFromLocalIfValid(event: SmartCacheLoadEvent): SmartCacheLoadEvent | null {
    const key = event.key
    const memoryCachedResult = this.cache$.value[key]
    if (memoryCachedResult && this.isValid(memoryCachedResult)) {
      this.events$.next(memoryCachedResult)
      return null
    }

    if (!this.localCacheChecked[key]) {
      this.localCacheChecked[key] = true
      if (this.dir.existsJson('cache', key)) {
        const localCachedValue = this.dir.loadJson<SmartCacheEvent<T>>('cache', key)
        if (localCachedValue && this.isValid(localCachedValue)) {
          this.cache$.next({ ...this.cache$.value, [key]: localCachedValue })
          this.events$.next(localCachedValue)
          return null
        }
      }
    }

    return event
  }

  private addToCache(event: SmartCacheEvent<T>) {
    this.dir.writeJson(['cache', event.key], event)
    this.cache$.next({ ...this.cache$.value, [event.key]: event })
  }

  private isValid(value: SmartCacheEvent<T> | null): boolean {
    return Date.now() - (value?.timestampMs ?? 0) < 120_000
  }

  public load(config: SmartCacheLoadConfig): Observable<SmartCacheEvent<T>> {
    return new Observable<SmartCacheEvent<T>>((sub) => {
      const eventSub = this.events$.pipe(filter((e) => e.key === config.key)).subscribe((e) => {
        sub.next(e)

        if (e.type === "result") {
          sub.complete()
          eventSub.unsubscribe()
        }
      })

      this.taskQueue$.next({ key: config.key })
    })
  }
}
