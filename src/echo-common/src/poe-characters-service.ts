import { CachedTask } from './cached-task'
import { GGG_API } from './echo-context'
import { Observable, map } from 'rxjs'
import { PoeCharacter } from 'sage-common'

export class PoeCharactersService {
  public characterListCache = new CachedTask<PoeCharacter[]>(() => GGG_API.getCharacters())
  public characterCache = new CachedTask<PoeCharacter>((key) => GGG_API.getCharacter(key))

  public characterList(): Observable<PoeCharacter[] | null | undefined> {
    return this.characterListCache.cache$.pipe(
      map((e) => Object.values(e)?.[0]?.result)
    )
  }
}

