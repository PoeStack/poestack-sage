import { EchoDirService } from './echo-dir-service'

export type EchoPluginConfig = {
  name: string
  version: string
  enabled: boolean
  path: string
}

export type EchoPluginConfigs = Record<string, EchoPluginConfig>

export class EchoPluginConfigService {
  constructor(private echoDir: EchoDirService) {}

  public loadPluginConfigs(): EchoPluginConfigs {
    if (this.echoDir.existsJson('plugin-config')) {
      const loadedPluginConfig: EchoPluginConfigs | null = this.echoDir.loadJson('plugin-config')
      if (loadedPluginConfig) {
        return loadedPluginConfig
      }
    }
    return this.writePluginConfigs({})
  }

  public writePluginConfigs(pluginConfigObject: EchoPluginConfigs): EchoPluginConfigs {
    return this.echoDir.writeJson(['plugin-config'], pluginConfigObject)
  }
}
