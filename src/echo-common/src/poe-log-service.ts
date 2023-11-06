import { Tail } from 'tail'
import { map, Subject } from 'rxjs'
import { filterNullish } from 'ts-ratchet'
import path from 'path'
import * as os from 'os'
import * as fs from 'fs'

export type PoeLogEventType = 'GENERATING_AREA'

export type PoeLogEvent = {
  type: PoeLogEventType
  raw: string
  properties: { [key: string]: string }
}

interface PoeLogEventParser {
  parse(raw: string): PoeLogEvent | undefined
}

export class PoeLogService {
  private logTail: Tail | null = null

  public logRaw$ = new Subject<string>()
  public logEvents$ = new Subject<PoeLogEvent>()

  public parsers: PoeLogEventParser[] = []

  constructor() {
    const path = this.getLogFilePath()
    if (path) {
      this.logTail = new Tail(path, { useWatchFile: true, fsWatchOptions: { interval: 1000 } })
      this.logTail.on('line', (line) => this.logRaw$.next(line))
    }

    this.logRaw$
      .pipe(
        map((raw) => {
          for (const parser of this.parsers) {
            const event = parser.parse(raw)
            if (event) {
              return event
            }
          }
        }),
        filterNullish()
      )
      .subscribe(this.logEvents$)
  }

  private getLogFilePath(): string | null {
    const possiblePaths = [
      path.join(
        'C:',
        'Program Files (x86)',
        'Grinding Gear Games',
        'Path of Exile',
        'logs',
        'Client.txt'
      ),
      path.join(
        'C:',
        'Program Files',
        'Grinding Gear Games',
        'Path of Exile',
        'logs',
        'Client.txt'
      ),
      path.join(os.homedir(), 'Library', 'Caches', 'com.GGG.PathOfExile', 'Logs', 'Client.txt')
    ]

    for (const logPath of possiblePaths) {
      if (fs.existsSync(logPath)) {
        return logPath
      }
    }

    return null
  }
}

export const POE_LOG_SERVICE = new PoeLogService()
