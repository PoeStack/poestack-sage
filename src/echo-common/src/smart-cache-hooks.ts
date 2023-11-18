import { useCallback, useEffect, useState } from "react";
import { SmartCache, SmartCacheEvent, SmartCacheLoadConfig, SmartCacheStore } from "./smart-cache";
import { filterNullish } from "ts-ratchet";
import { Observable, map, of, tap } from 'rxjs'

export type SmartCacheHookType<T> = SmartCacheStore<T> & {
  value: T | null | undefined,
  valueAge: () => number | undefined,

  loadNow: () => void,
  load: () => Observable<SmartCacheEvent<T>>
}

export function useCache<T>(cache: SmartCache<T>, config: SmartCacheLoadConfig): SmartCacheHookType<T> {
  const subject = cache.memoryCache$
  const initalValue = subject.getValue()?.[config.key] ?? {};
  const [value, setValue] = useState(initalValue);

  const load = useCallback(() => {
    if (config.key) {
      return cache.load(config)
    }
    return of()
  }, [cache, config]);

  useEffect(() => {
    if (value?.lastResultEvent?.key && value?.lastResultEvent?.key !== config.key) {
      setValue(subject.getValue()?.[config.key] ?? {})
    }
    const subscription = subject.pipe(
      tap((e) => console.log('event', config.key, e)),
      map((e) => e[config.key]),
      filterNullish()
    ).subscribe((newValue) => {
      setValue(newValue);
    });

    load().subscribe()
    return () => {
      subscription.unsubscribe();
    };
  }, [subject, config]);

  const result: SmartCacheHookType<T> = {
    lastResultEvent: value.lastResultEvent,
    lastStatusEvent: value.lastStatusEvent,
    value: value?.lastResultEvent?.result,
    valueAge: () => value.lastResultEvent ? (Date.now() - value.lastResultEvent.timestampMs) : NaN,
    load: () => load(),
    loadNow: () => load().subscribe()
  }
  return result
}
