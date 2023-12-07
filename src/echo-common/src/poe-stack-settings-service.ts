import { EchoDirService } from './echo-dir-service'

export type PoeStackSettings = {
  minimizeToTrayOnClose: boolean
  poeClientLogPath: string
}

export class PoeStackSettingsService {
  constructor(private echoDir: EchoDirService) {
    if (!this.echoDir.existsJson('poe-stack-settings')) {
      this.echoDir.writeJson(['poe-stack-settings'], this.defaultPoeStackSettings)
    }
  }

  private defaultPoeStackSettings: PoeStackSettings = {
    minimizeToTrayOnClose: false,
    poeClientLogPath: ''
  }

  public loadPoeStackSettings(): PoeStackSettings {
    return this.echoDir.loadJson('poe-stack-settings') ?? this.defaultPoeStackSettings
  }

  public writePoeStackSettings(settings: Partial<PoeStackSettings>) {
    const mergedSettings = { ...this.loadPoeStackSettings(), ...settings }
    this.echoDir.writeJson(['poe-stack-settings'], mergedSettings)
    return mergedSettings
  }
}
