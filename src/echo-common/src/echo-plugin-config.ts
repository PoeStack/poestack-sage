import { ECHO_DIR } from './echo-dir-service'

export type EchoPluginConfig = {
  name: string
  version: string
  enabled: boolean
  path: string
}

export type EchoPluginConfigs = Record<string, EchoPluginConfig>

export class EchoPluginConfigService {
  public loadPluginConfigs() {
    if (ECHO_DIR.existsJson('plugin-config')) {
      const loadedPluginConfig: EchoPluginConfigs | null = ECHO_DIR.loadJson('plugin-config')
      if (loadedPluginConfig) {
        return loadedPluginConfig
      }
    }
    return this.writePluginConfigs({})
  }

  public writePluginConfigs(pluginConfigObject: EchoPluginConfigs) {
    return ECHO_DIR.writeJson(['plugin-config'], pluginConfigObject)
  }
}

export const ECHO_PLUGIN_CONFIG = new EchoPluginConfigService()
