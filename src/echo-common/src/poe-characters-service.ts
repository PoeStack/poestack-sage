import { GggApi } from 'ggg-api'
import { SmartCache, SmartCacheLoadConfig } from './cached-task'
import { Observable, map } from 'rxjs'
import { PoeCharacter } from 'sage-common'
import { EchoDirService } from './echo-dir-service'

export class PoeCharactersService {
  private characterListCache = new SmartCache<PoeCharacter[]>(this.echoDir, () =>
    this.gggApi.getCharacters()
  )
  private characterCache = new SmartCache<PoeCharacter>(this.echoDir, (key) =>
    this.gggApi.getCharacter(key)
  )

  constructor(
    private echoDir: EchoDirService,
    private gggApi: GggApi
  ) {}

  public character(config: SmartCacheLoadConfig): Observable<PoeCharacter | null | undefined> {
    const result = this.characterCache.cache$.pipe(map((e) => e[name]?.result))
    return result
  }

  public characterList(): Observable<PoeCharacter[] | null | undefined> {
    return this.characterListCache.cache$.pipe(map((e) => Object.values(e)?.[0]?.result))
  }
}
