import { BehaviorSubject } from 'rxjs'
import { EchoDirService } from './echo-dir-service'

export type PoeStackSettings = {
  minimizeToTrayOnClose: boolean
  poeClientLogPath: string
}

export class PoeStackSettingsService {
  constructor(private echoDir: EchoDirService) {
    if (!this.echoDir.existsJson('poe-stack-settings')) {
      this.echoDir.writeJson(['poe-stack-settings'], this.defaultPoeStackSettings)
    } else {
      this.getPoeStackSettings()
    }
  }

  private defaultPoeStackSettings: PoeStackSettings = {
    minimizeToTrayOnClose: false,
    poeClientLogPath: ''
  }

  public poeStackSettings$ = new BehaviorSubject<PoeStackSettings>(this.defaultPoeStackSettings)

  public getPoeStackSettings(): PoeStackSettings {
    const settings =
      this.echoDir.loadJson<PoeStackSettings>('poe-stack-settings') ?? this.defaultPoeStackSettings
    this.poeStackSettings$.next(settings)
    return settings
  }

  public writePoeStackSettings(settings: Partial<PoeStackSettings>) {
    const mergedSettings = { ...this.getPoeStackSettings(), ...settings }
    this.echoDir.writeJson(['poe-stack-settings'], mergedSettings)
    this.poeStackSettings$.next(mergedSettings)
    return mergedSettings
  }
}
