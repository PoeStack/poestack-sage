import { BehaviorSubject, filter, map, Observable, of, Subject } from 'rxjs'
import { concatMap, delay, tap } from 'rxjs/operators'
import { EchoDirService } from './echo-dir-service'

export type SmartCacheLoadConfig = {
  key: string,
  maxCacheAgeMs?: number
}

export type SmartCacheBaseEvent = {
  key: string,
  timestampMs: number,
}

export type SmartCacheResultEvent<T> = SmartCacheBaseEvent & {
  type: "result",
  result: T | null | undefined,
}

export type SmartCacheQueuedEvent = SmartCacheBaseEvent & {
  type: "queued",
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

export type SmartCacheStatusEvent = SmartCacheLoadingEvent | SmartCacheErrorEvent | SmartCacheRateLimitEvent | SmartCacheQueuedEvent

export type SmartCacheEvent<T> = SmartCacheStatusEvent | SmartCacheResultEvent<T>

export type SmartCacheStore<T> = {
  lastResultEvent: SmartCacheResultEvent<T> | undefined,
  lastErorrEvent: SmartCacheErrorEvent | undefined,
  lastRequestEvent: SmartCacheEvent<T> | undefined,
}

export type SmartCacheJob = {
  config: SmartCacheLoadConfig
}

export class SmartCache<T> {
  private events$ = new Subject<SmartCacheEvent<T>>()
  private workQueue$ = new Subject<SmartCacheQueuedEvent>()

  public memoryCache$ = new BehaviorSubject<{ [key: string]: SmartCacheStore<T> }>({})
  private localCacheChecked: { [key: string]: boolean } = {}

  constructor(
    private dir: EchoDirService,
    loadFun: (key: string) => Observable<T | null>
  ) {
    this.events$.subscribe((e) => {
      const currentStore = this.memoryCache$.value[e.key] ?? {}
      const nextStore = { ...currentStore, lastRequestEvent: e!! }

      if (e.type === "error") {
        nextStore.lastErorrEvent = e
      }

      if (e.type === "result") {
        nextStore.lastResultEvent = e
        nextStore.lastErorrEvent = undefined
        this.persist(e)
      }

      this.memoryCache$.next({ ...this.memoryCache$.value, [e.key]: nextStore })
    })

    this.workQueue$.pipe(
      concatMap((e) => {
        const ratelimitDelayMs = 1000 //calculate rate limit here
        console.log("pre-ratelimit", e, ratelimitDelayMs)
        this.events$.next({ type: "rate-limit", key: e.key, timestampMs: Date.now(), limitExpiresMs: ratelimitDelayMs })
        return of(e).pipe(
          delay(ratelimitDelayMs),
          tap((e) => console.log("post-ratelimit", e)),
          concatMap((e) => {
            return loadFun(e.key).pipe(map((r) => ({ e, r })))
          }
          )
        )
      })
    ).subscribe(({ e, r }) => {
      this.events$.next({ type: "result", result: r, key: e.key, timestampMs: Date.now() })
    })
  }

  private loadFromLocalIfValid(config: SmartCacheLoadConfig): SmartCacheResultEvent<T> | null {
    const key = config.key
    const memoryCachedResult = this.memoryCache$.value[key]?.lastResultEvent
    if (memoryCachedResult && this.isValid(config, memoryCachedResult)) {
      return memoryCachedResult
    }

    if (!this.localCacheChecked[key]) {
      this.localCacheChecked[key] = true
      if (this.dir.existsJson('cache', key)) {
        const localCachedValue = this.dir.loadJson<SmartCacheResultEvent<T>>('cache', key)
        if (localCachedValue && this.isValid(config, localCachedValue)) {
          return localCachedValue
        }
      }
    }

    return null
  }

  private persist(event: SmartCacheResultEvent<T>) {
    this.dir.writeJson(['cache', event.key], { ...event, source: "cache-local" })
  }

  private isValid(config: SmartCacheLoadConfig, value: SmartCacheResultEvent<T> | undefined | null): boolean {
    const maxCacheAgeMs = config.maxCacheAgeMs === undefined ? 120_000 : config.maxCacheAgeMs
    return Date.now() - (value?.timestampMs ?? 0) < maxCacheAgeMs
  }

  public fromCache(key: string): Observable<SmartCacheStore<T> | null | undefined> {
    return this.memoryCache$.pipe(
      map((e) => e[key])
    )
  }

  public load(config: SmartCacheLoadConfig): Observable<SmartCacheEvent<T>> {
    if (config.key === null || config.key === undefined) {
      throw new Error("Config key cannot be null or undefined")
    }

    return new Observable<SmartCacheEvent<T>>((sub) => {
      const localResult = this.loadFromLocalIfValid(config)
      if (localResult) {
        sub.next(localResult)
        sub.complete()
      } else {
        const eventSub = this.events$.pipe(
          filter((e) => e.key === config.key)
        ).subscribe((e) => {
          sub.next(e)

          if (e.type === "error") {
            sub.error(e.error)
            sub.complete()
            eventSub.unsubscribe()
          }

          if (e.type === "result") {
            sub.complete()
            eventSub.unsubscribe()
          }
        })

        const currentStore = this.memoryCache$.value[config.key] ?? {}
        if (!currentStore.lastRequestEvent?.type || currentStore.lastRequestEvent?.type === "result") {
          const nextEvent: SmartCacheQueuedEvent = { type: "queued", key: config.key, timestampMs: Date.now() }
          this.memoryCache$.next({ ...this.memoryCache$.value, [config.key]: { ...currentStore, lastRequestEvent: nextEvent!! } })
          this.events$.next(nextEvent)
          this.workQueue$.next(nextEvent)
        }
      }
    })
  }
}
