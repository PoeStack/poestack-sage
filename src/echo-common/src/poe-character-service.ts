import { GggApi } from 'ggg-api'
import { SmartCache, SmartCacheLoadConfig } from './smart-cache'
import { PoeCharacter } from 'sage-common'
import { EchoDirService } from './echo-dir-service'
import { useCache } from './smart-cache-hooks'

export class PoeCharacterService {
  public cacheCharacterList = new SmartCache<PoeCharacter[]>(this.echoDir, () =>
    this.gggApi.getCharacters()
  )
  public cacheCharacter = new SmartCache<PoeCharacter>(this.echoDir, (key) =>
    this.gggApi.getCharacter(key)
  )

  constructor(
    private echoDir: EchoDirService,
    private gggApi: GggApi
  ) {}

  public useCharacterList(config: SmartCacheLoadConfig = { key: 'poe_character_list' }) {
    return useCache(this.cacheCharacterList, config)
  }

  public useCharacter(name: string, config: SmartCacheLoadConfig = { key: name }) {
    return useCache(this.cacheCharacter, config)
  }
}
