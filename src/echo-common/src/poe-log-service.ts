import { Tail } from 'tail'
import { from, map, Subject } from 'rxjs'
import { filterNullish } from 'ts-ratchet'
import path from 'path'
import * as os from 'os'
import * as fs from 'fs'

export type PoeLogEventType = 'GENERATING_AREA'

export type PoeLogTextEvent = {
  raw: string
  time: Date
  systemUptime: number
  type: string
}

export type PoeZoneGenerationEvent = PoeLogTextEvent & {
  type: 'ZoneGenerationEvent'
  area: string
}

export type PoeZoneEntranceEvent = PoeLogTextEvent & {
  type: 'ZoneEntranceEvent'
  location: string
}

export type PoEInstanceConnectionEvent = PoeLogTextEvent & {
  type: 'InstanceConnectionEvent'
  server: string
}

export type PoeNPCEncounterEvent = PoeLogTextEvent

export type PoECharacterSlainEvent = PoeLogTextEvent & {
  type: 'CharacterSlainEvent'
  character: string
  isMyCharacter: boolean
}

export type PoeLogEvent =
  | PoeZoneGenerationEvent
  | PoeZoneEntranceEvent
  | PoEInstanceConnectionEvent
  | PoeNPCEncounterEvent
  | PoECharacterSlainEvent

interface PoeLogEventParser {
  parse(raw: string): PoeLogEvent | undefined
}

class ZoneEnteranceEventParser implements PoeLogEventParser {
  parse(raw: string): PoeZoneEntranceEvent | undefined {
    if (raw.includes('] : You have entered')) {
      return {
        type: 'ZoneEntranceEvent',
        systemUptime: Number(raw.split(' ')[2]),
        raw: raw,
        location: raw.slice(raw.indexOf('entered ') + 'entered '.length, -1),
        time: new Date()
      }
    }
    return undefined
  }
}

class InstanceConnectionEventParser implements PoeLogEventParser {
  parse(raw: string): PoEInstanceConnectionEvent | undefined {
    if (raw.includes('] Connecting to instance server at')) {
      return {
        type: 'InstanceConnectionEvent',
        raw: raw,
        systemUptime: Number(raw.split(' ')[2]),
        server: raw.slice(raw.indexOf('at ') + 'at '.length, -1),
        time: new Date()
      }
    }
    return undefined
  }
}

const NPCEncounterMap = new Map<string, string>([
  ['Einhar, Beastmaster', 'EinharEncounterEvent'],
  ['Alva --TODO', 'AlvaEncounterEvent'] //TODO ADD ALL MASTERS HERE, AND ALSO IMPLEMENT LOGIC FOR SPECIFICS THINGS, LIKE EINHAR COMPLETE,
])

class NPCEncounterEventParser implements PoeLogEventParser {
  parse(raw: string): PoeNPCEncounterEvent | undefined {
    NPCEncounterMap.forEach((key, val) => {
      if (raw.includes(key)) {
        return {
          type: val,
          raw: raw,
          systemUptime: Number(raw.split(' ')[2]),
          time: new Date()
        }
      }
    })

    return undefined
  }
}

const characterSlainRegex = new RegExp(' : [S]* has been slain.')

class CharacterSlainEventParser implements PoeLogEventParser {
  parse(raw: string): PoECharacterSlainEvent | undefined {
    const match = characterSlainRegex.exec(raw)
    const character = match == null ? null : match[0]

    if (character) {
      return {
        type: 'CharacterSlainEvent',
        raw: raw,
        character: character,
        isMyCharacter: character === settingsService.currentCharacter ? true : false,
        systemUptime: Number(raw.split(' ')[2]),
        time: new Date()
      }
    } else if (raw.includes(' has been slain.')) {
      console.debug('Something probably went wrong, should check that out!')
    }

    return undefined
  }
}

export class PoeLogService {
  private logTail: Tail | null = null

  public logRaw$ = new Subject<string>()
  public logEvents$ = new Subject<PoeLogEvent>()

  public parsers: PoeLogEventParser[] = [
    new ZoneEnteranceEventParser(),
    new InstanceConnectionEventParser(),
    new NPCEncounterEventParser()
  ]

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
      path.join(os.homedir(), 'Library', 'Caches', 'com.GGG.PathOfExile', 'Logs', 'Client.txt'),
      path.join(
        os.homedir(),
        '.steam',
        'steam',
        'steamapps',
        'common',
        'Path of Exile',
        'logs',
        'Client.txt'
      )
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
