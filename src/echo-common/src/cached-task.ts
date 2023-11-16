import { BehaviorSubject, filter, groupBy, map, mergeMap, Observable, Subject, take } from 'rxjs'
import { throttleTime } from 'rxjs/operators'
import { filterNullish } from 'ts-ratchet'
import { EchoDirService } from './echo-dir-service'

export type CachedTaskEvent<T> = {
  key: string
  state?: string
  status?: string
  result?: T | null | undefined
  timestampMs?: number
}

export class CachedTask<T> {
  private tasks$ = new Subject<CachedTaskEvent<T>>()
  public events$ = new Subject<CachedTaskEvent<T>>()
  public cache$ = new BehaviorSubject<{ [key: string]: CachedTaskEvent<T> }>({})

  constructor(
    private dir: EchoDirService,
    loadFun: (key: string) => Observable<T | null>
  ) {
    this.tasks$
      .pipe(
        filter(({ key }) => !this.isValid(this.cache$.value[key])),
        groupBy((item) => item.key),
        mergeMap((group) => group.pipe(throttleTime(60000))),
        map((e) => (this.loadFromLocal(e.key) ? null : e)),
        filterNullish()
      )
      .subscribe((e) => {
        loadFun(e.key)
          .pipe(take(1))
          .subscribe((r) => {
            const finalEvent: CachedTaskEvent<T> = {
              key: e.key,
              state: 'complete',
              result: r,
              timestampMs: Date.now()
            }
            this.events$.next(finalEvent)
            this.addToCache(finalEvent)
          })
      })
  }

  private loadFromLocal(key: string): boolean {
    if (this.cache$.value[key]) {
      return false
    }

    if (this.dir.existsJson('cache', key)) {
      const localCachedValue = this.dir.loadJson<CachedTaskEvent<T>>('cache', key)
      if (this.isValid(localCachedValue)) {
        this.cache$.next({ ...this.cache$.value, [key]: localCachedValue!! })
        return true
      }
    }

    return false
  }

  private addToCache(event: CachedTaskEvent<T>) {
    this.dir.writeJson(['cache', event.key], event)
    this.cache$.next({ ...this.cache$.value, [event.key]: event })
  }

  private isValid(value: CachedTaskEvent<T> | null): boolean {
    return Date.now() - (value?.timestampMs ?? 0) < 120_000
  }

  public load(key: string): Observable<CachedTaskEvent<T>> {
    return new Observable<CachedTaskEvent<T>>((sub) => {
      const eventSub = this.events$.pipe(filter((e) => e.key === key)).subscribe((e) => {
        sub.next(e)

        if (e.state === 'complete') {
          sub.complete()
          eventSub.unsubscribe()
        }
      })

      this.tasks$.next({ key: key })
    })
  }
}
