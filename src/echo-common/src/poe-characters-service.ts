import { GggApi } from 'ggg-api'
import { SmartCache, SmartCacheLoadConfig } from './smart-cache'
import { PoeCharacter } from 'sage-common'
import { EchoDirService } from './echo-dir-service'
import { useEffect, useState } from 'react'
import { filter, map, tap } from 'rxjs'
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
    return this.useCache(this.characterListCache)
  }

  public useCharacter() {
    return this.useCache(this.characterCache)
  }

  public useCache<T>(cache: SmartCache<T>) {
    const subject = cache.memoryCache$
    const [key, setKey] = useState("")
    const initalValue = subject.getValue()?.[key] ?? {};
    const [value, setValue] = useState(initalValue);

    useEffect(() => {
      const subscription = subject.pipe(
        tap((e) => console.log('s', key, e)),
        map((e) => e[key]),
        filterNullish()
      ).subscribe((newValue) => {
        setValue(newValue);
      });
      return () => {
        subscription.unsubscribe();
      };
    }, [subject, key]);

    return { value: value, load: (config: SmartCacheLoadConfig) => {
      if(key !== config.key) {
        setKey(config.key)
      }
      cache.load(config).subscribe()
    } }
  }
}
