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

export type SmartCacheStore<T> = {
  lastResultEvent: SmartCacheEvent<T> | undefined,
  lastEvent: SmartCacheEvent<T> | undefined,
}

export type SmartCacheHookType<T> = SmartCacheStore<T> & {
  key: () => string,

  result: () => T | null | undefined,
  resultTimestamp: () => number | undefined,
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

  private memoryCache$ = new BehaviorSubject<{ [key: string]: SmartCacheStore<T> }>({})
  private localCacheChecked: { [key: string]: boolean } = {}

  constructor(
    private dir: EchoDirService,
    loadFun: (key: string) => Observable<T | null>
  ) {
    this.events$.subscribe((event) => {
      const currentStore = this.memoryCache$.value[event.key]
      const nextStore = { ...currentStore, lastEvent: event }
      if (event.type === "result") {
        nextStore.lastResultEvent = event
      }
      this.memoryCache$.next({ ...this.memoryCache$.value, [event.key]: nextStore })
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
        loadFun(job.config.key)
          .pipe(take(1))
          .subscribe((result) => {
            const resultEvent: SmartCacheEvent<T> = {
              type: "result",
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
    this.dir.writeJson(['cache', event.key], event)
  }

  private isValid(value: SmartCacheResultEvent<T> | undefined | null): boolean {
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

      this.jobQueue$.next({ config: config })
    })
  }
}
