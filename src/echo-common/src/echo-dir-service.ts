import path from 'path'
import * as os from 'os'
import * as fs from 'fs'

export class EchoDirService {
  homeDirPath = path.resolve(os.homedir(), 'poestack-sage')

  constructor() {
    this.ensureDirExists('plugins')
    this.ensureDirExists('cache')
    this.ensureDirExists('cache', 'plugins')
  }

  public ensureDirExists(...dirPathFragment: string[]) {
    const resolved = path.resolve(this.homeDirPath, ...dirPathFragment)
    if (!fs.existsSync(resolved)) {
      fs.mkdirSync(resolved, { recursive: true })
    }
  }

  public existsJson(...jsonPath: string[]): boolean {
    return fs.existsSync(path.resolve(this.homeDirPath, ...jsonPath) + '.json')
  }

  public deleteJson(...jsonPath: string[]) {
    try {
      fs.rmSync(path.resolve(this.homeDirPath, ...jsonPath) + '.json')
    } catch (e) {
      console.log(e)
    }
  }

  public loadJson<T>(...jsonPath: string[]): T | null {
    const resolvedPath = path.resolve(this.homeDirPath, ...jsonPath) + '.json'
    try {
      return JSON.parse(fs.readFileSync(resolvedPath).toString())
    } catch (e) {
      console.log(e)
    }
    return null
  }

  public writeJson(jsonPath: string[], value: any) {
    const resolvedPath = path.resolve(this.homeDirPath, ...jsonPath)
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true })
    fs.writeFileSync(resolvedPath + '.json', JSON.stringify(value))
    return value
  }
}
