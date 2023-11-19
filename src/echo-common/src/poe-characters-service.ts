import { GggApi } from 'ggg-api'
import { CachedTask } from './cached-task'
import { Observable, map } from 'rxjs'
import { PoeCharacter } from 'sage-common'
import { EchoDirService } from './echo-dir-service'

export class PoeCharactersService {
  public characterListCache = new CachedTask<PoeCharacter[]>(this.echoDir, () =>
    this.gggApi.getCharacters()
  )
  public characterCache = new CachedTask<PoeCharacter>(this.echoDir, (key) =>
    this.gggApi.getCharacter(key)
  )

  constructor(
    private echoDir: EchoDirService,
    private gggApi: GggApi
  ) {}

  public character(name: string): Observable<PoeCharacter | null | undefined> {
    const result = this.characterCache.cache$.pipe(map((e) => e[name]?.result))
    return result
  }

  public characterList(): Observable<PoeCharacter[] | null | undefined> {
    return this.characterListCache.cache$.pipe(map((e) => Object.values(e)?.[0]?.result))
  }
}
