import { useCallback, useEffect, useState } from 'react'
import {
  SmartCache,
  SmartCacheEvent,
  SmartCacheLoadConfig,
  SmartCacheResultEvent,
  SmartCacheStore
} from './smart-cache'
import { filterNullish } from 'ts-ratchet'
import { Observable, UnaryFunction, map, filter, pipe, OperatorFunction, tap } from 'rxjs'

export function validResultsWithNullish<T>(): UnaryFunction<
  Observable<SmartCacheEvent<T>>,
  Observable<T | null | undefined>
> {
  return pipe(
    filter((x) => x.type === 'result') as OperatorFunction<
      SmartCacheEvent<T>,
      SmartCacheResultEvent<T>
    >,
    map((e) => e.result)
  )
}

export function validResults<T>(): UnaryFunction<Observable<SmartCacheEvent<T>>, Observable<T>> {
  return pipe(validResultsWithNullish(), filterNullish())
}

export type SmartCacheHookType<T> = SmartCacheStore<T> & {
  value: T | null | undefined
  valueAge: () => number | undefined

  loadNow: () => void
  load: () => Observable<SmartCacheEvent<T>>
}

export function useCache<T>(
  cache: SmartCache<T>,
  config: SmartCacheLoadConfig,
  loadFun: () => Observable<T | null>
): SmartCacheHookType<T> {
  const subject = cache.cache()
  const initalValue = subject.getValue()?.[config.key] ?? {}
  const [value, setValue] = useState(initalValue)

  const load = useCallback(() => {
    return cache.load(config, loadFun)
  }, [cache, config, loadFun])

  useEffect(() => {
    if (value?.lastResultEvent?.key && value?.lastResultEvent?.key !== config.key) {
      setValue(subject.getValue()?.[config.key] ?? {})
    }
    const subscription = subject
      .pipe(
        tap((e) => console.log('event', config.key, e)),
        map((e) => e[config.key]),
        filterNullish()
      )
      .subscribe((newValue) => {
        setValue(newValue)
      })

    if (config.key !== null && config.key !== undefined) {
      load().subscribe()
    }
    return () => {
      subscription.unsubscribe()
    }
    // TODO Investigate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, config, load])

  const result: SmartCacheHookType<T> = {
    lastResultEvent: value.lastResultEvent,
    lastRequestEvent: value.lastRequestEvent,
    lastErorrEvent: value.lastErorrEvent,
    value: value?.lastResultEvent?.result,
    valueAge: () => (value.lastResultEvent ? Date.now() - value.lastResultEvent.timestampMs : NaN),
    load: () => load(),
    loadNow: () => load().subscribe()
  }
  return result
}
