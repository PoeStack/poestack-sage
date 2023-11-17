import { GggApi } from 'ggg-api'
import { SmartCache } from './smart-cache'
import { PoeCharacter } from 'sage-common'
import { EchoDirService } from './echo-dir-service'

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
}
