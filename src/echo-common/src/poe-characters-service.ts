import { GggApi } from 'ggg-api'
import { SmartCache, SmartCacheLoadConfig } from './smart-cache'
import { PoeCharacter } from 'sage-common'
import { EchoDirService } from './echo-dir-service'
import { useCallback, useEffect, useRef, useState } from 'react'
import { map, tap } from 'rxjs'
import { filterNullish } from 'ts-ratchet'

export class PoeCharactersService {
  public characterListCache = new SmartCache<PoeCharacter[]>(this.echoDir, () =>
    this.gggApi.getCharacters()
  )
  public characterCache = new SmartCache<PoeCharacter>(this.echoDir, (key) =>
    this.gggApi.getCharacter(key)
  )

  constructor(
    private echoDir: EchoDirService,
    private gggApi: GggApi
  ) { }

  public useCharacterList() {
    return this.useCache(this.characterListCache, { key: "*" })
  }

  public useCharacter(name: string) {
    return this.useCache(this.characterCache, { key: name })
  }

  public useCache<T>(cache: SmartCache<T>, config: SmartCacheLoadConfig) {
    const subject = cache.memoryCache$
    const initalValue = subject.getValue()?.[config.key] ?? {};
    const [value, setValue] = useState(initalValue);

    const load = useCallback(() => {
      cache.load(config).subscribe();
    }, [cache, config]);

    useEffect(() => {
      const subscription = subject.pipe(
        tap((e) => console.log('event', config.key, e)),
        map((e) => e[config.key]),
        filterNullish()
      ).subscribe((newValue) => {
        setValue(newValue);
      });

      load()
      return () => {
        subscription.unsubscribe();
      };
    }, [subject, config]);


    return {
      value: value,
      load: load
    }
  }
}
