import { GggApi } from 'ggg-api'
import { SmartCache, SmartCacheLoadConfig } from './smart-cache'
import { PoeCharacter } from 'sage-common'
import { EchoDirService } from './echo-dir-service'
import { useCache } from './smart-cache-hooks'

export class PoeCharacterService {
  public cacheCharacterList = new SmartCache<PoeCharacter[]>(this.echoDir, "poe-character-list")
  public cacheCharacter = new SmartCache<PoeCharacter>(this.echoDir, "poe-character")

  constructor(
    private echoDir: EchoDirService,
    private gggApi: GggApi
  ) { }

  public useCharacterList(config: SmartCacheLoadConfig = { key: 'poe_character_list' }) {
    return useCache(
      this.cacheCharacterList,
      config,
      () => this.gggApi.getCharacters()
    )
  }

  public useCharacter(name: string, config: SmartCacheLoadConfig = { key: name }) {
    return useCache(
      this.cacheCharacter,
      config,
      () => this.gggApi.getCharacter(name)
    )
  }
}
