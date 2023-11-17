import { GggApi } from 'ggg-api'
import { SmartCache } from './smart-cache'
import { PoeCharacter } from 'sage-common'
import { EchoDirService } from './echo-dir-service'
import { useEffect, useState } from 'react'

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
    const subject = this.characterListCache.memoryCache$
    const [value, setValue] = useState(subject.getValue());

    useEffect(() => {
      const subscription = subject.subscribe((newValue) => {
        setValue(newValue);
      });
      return () => {
        subscription.unsubscribe();
      };
    }, [subject]);

    return { value: value, load: () => { this.characterListCache.load({ key: "*", source: "test" }).subscribe() } }
  }
}
