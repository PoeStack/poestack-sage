import { GggApi } from 'ggg-api'
import { SmartCache } from './smart-cache'
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
    return this.useCache(this.characterListCache, "*")
  }

  public useCache<T>(cache: SmartCache<T>, key: string) {
    const subject = cache.memoryCache$
    const [value, setValue] = useState(subject.getValue()?.[key]);

    useEffect(() => {
      const subscription = subject.pipe(
        tap((e) => console.log('s', e)),
        map((e) => e[key]),
        filterNullish()
      ).subscribe((newValue) => {
        setValue(newValue);
      });
      return () => {
        subscription.unsubscribe();
      };
    }, [subject]);

    return { value: value, load: () => { cache.load({ key: key, source: "test" }).subscribe() } }
  }
}
