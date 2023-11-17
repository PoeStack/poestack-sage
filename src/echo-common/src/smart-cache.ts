import { BehaviorSubject, filter, groupBy, map, mergeMap, Observable, Subject, take } from 'rxjs'
import { throttleTime } from 'rxjs/operators'
import { filterNullish } from 'ts-ratchet'
import { EchoDirService } from './echo-dir-service'

export type SmartCacheLoadMode = "Default" | "CacheOnly" | "NoCache"

export type SmartCacheLoadConfig = {
  key: string,
  mode?: SmartCacheLoadMode
}

export type SmartCacheBaseEvent = {
  key: string,
  timestampMs: number,
}

export type SmartCacheResultEvent<T> = SmartCacheBaseEvent & {
  type: "result",
  source: "cache-local" | "cache-memory" | "live",
  result: T | null | undefined,
}

export type SmartCacheLoadingEvent = SmartCacheBaseEvent & {
  type: "loading",
}

export type SmartCacheErrorEvent = SmartCacheBaseEvent & {
  type: "error",
  error: any
}

export type SmartCacheRateLimitEvent = SmartCacheBaseEvent & {
  type: "rate-limit",
  limitExpiresMs: number
}

export type SmartCacheStatusEvent = SmartCacheLoadingEvent | SmartCacheErrorEvent | SmartCacheRateLimitEvent

export type SmartCacheEvent<T> = SmartCacheStatusEvent | SmartCacheResultEvent<T>

export type SmartCacheStore<T> = {
  lastResultEvent: SmartCacheResultEvent<T> | undefined,
  lastStatusEvent: SmartCacheStatusEvent | undefined,
}

export type SmartCacheHookType<T> = SmartCacheStore<T> & {
  key: () => string,

  result: () => T | null | undefined,
  resultAge: () => number | undefined,

  load: (config: SmartCacheLoadConfig) => Observable<SmartCacheEvent<T>>,
  loadSimple: () => void,
}

export type SmartCacheJob = {
  config: SmartCacheLoadConfig
}

export class SmartCache<T> {
  private jobQueue$ = new Subject<SmartCacheJob>()
  private events$ = new Subject<SmartCacheEvent<T>>()

  public memoryCache$ = new BehaviorSubject<{ [key: string]: SmartCacheStore<T> }>({})
  private localCacheChecked: { [key: string]: boolean } = {}

  constructor(
    private dir: EchoDirService,
    loadFun: (key: string) => Observable<T | null>
  ) {
    this.events$.subscribe((event) => {
      if (!(event.type === "result" && event.source === "cache-memory")) {
        const currentStore = this.memoryCache$.value[event.key] ?? {}
        const nextStore = { ...currentStore }

        if (event.type === "result") {
          nextStore.lastResultEvent = { ...event, source: "cache-memory" }
          if (event.source === "live" && event.timestampMs > (currentStore.lastStatusEvent?.timestampMs ?? 0)) {
            delete nextStore.lastStatusEvent
          }
        } else {
          nextStore.lastStatusEvent = event
        }

        this.memoryCache$.next({ ...this.memoryCache$.value, [event.key]: nextStore })
      }
    })

    this.jobQueue$
      .pipe(
        map((job) => this.loadFromLocalIfValid(job)),
        filterNullish(),
        groupBy((job) => job.config.key),
        mergeMap((group) => group.pipe(throttleTime(60000))), //can this be concat map, need some sort of switchmap interally to allow throttle bypass
        map((job) => this.loadFromLocalIfValid(job)),
        filterNullish()
        //if that is concat add rate limit here
      )
      .subscribe((job) => {
        console.log("firing", job.config.key)
        loadFun(job.config.key)
          .pipe(take(1))
          .subscribe((result) => {
            const resultEvent: SmartCacheEvent<T> = {
              type: "result",
              source: "live",
              key: job.config.key,
              result: result,
              timestampMs: Date.now()
            }
            this.persist(resultEvent)
            this.events$.next(resultEvent)
          })
      })
  }

  private loadFromLocalIfValid(job: SmartCacheJob): SmartCacheJob | null {
    const key = job.config.key
    const memoryCachedResult = this.memoryCache$.value[key]?.lastResultEvent
    if (memoryCachedResult && this.isValid(memoryCachedResult)) {
      this.events$.next(memoryCachedResult)
      return null
    }

    if (!this.localCacheChecked[key]) {
      this.localCacheChecked[key] = true
      if (this.dir.existsJson('cache', key)) {
        const localCachedValue = this.dir.loadJson<SmartCacheResultEvent<T>>('cache', key)
        if (localCachedValue && this.isValid(localCachedValue)) {
          this.events$.next(localCachedValue)
          return null
        }
      }
    }

    return job
  }

  private persist(event: SmartCacheResultEvent<T>) {
    this.dir.writeJson(['cache', event.key], { ...event, source: "cache-local" })
  }

  private isValid(value: SmartCacheResultEvent<T> | undefined | null): boolean {
    return Date.now() - (value?.timestampMs ?? 0) < 120_000
  }

  public fromCache(key: string): Observable<SmartCacheStore<T> | null | undefined> {
    return this.memoryCache$.pipe(
      map((e) => e[key])
    )
  }

  public load(config: SmartCacheLoadConfig): Observable<SmartCacheEvent<T>> {
    return new Observable<SmartCacheEvent<T>>((sub) => {
      const eventSub = this.events$.pipe(
        filter((e) => e.key === config.key)
      ).subscribe((e) => {
        sub.next(e)

        if (e.type === "result") {
          sub.complete()
          eventSub.unsubscribe()
        }
      })

      this.jobQueue$.next({ config: config })
    })
  }
}
