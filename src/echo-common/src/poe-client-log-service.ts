import { Tail } from 'tail'
import { map, Subject } from 'rxjs'
import { filterNullish } from 'ts-ratchet'
import path from 'path'
import * as os from 'os'
import * as fs from 'fs'

export type PoeClientLogTextEvent = {
  raw: string
  time: Date
  systemUptime: number
  type: string
}

export type PoeZoneEntranceEvent = PoeClientLogTextEvent & {
  type: 'ZoneEntranceEvent'
  location: string
}

export type PoeInstanceConnectionEvent = PoeClientLogTextEvent & {
  type: 'InstanceConnectionEvent'
  server: string
}

export type PoeNPCEventSubtype =
  | 'EinharEncounterEvent'
  | 'AlvaEncounterEvent'
  | 'NikoEncounterEvent'
  | 'CassiaEncounterEvent'
  | 'JunEncounterEvent'
  | 'DeleriumMirrorEvent'
  | 'HarvestEncounterEvent'
  | 'ExpeditionTujenEncounterEvent'
  | 'ExpeditionRogEncounterEvent'
  | 'ExpeditionGwennenEncounterEvent'
  | 'ExpeditionDannigEncounterEvent'

export type PoeNPCEncounterEvent = PoeClientLogTextEvent & {
  type: 'NPCEncounterEvent'
  subtype: PoeNPCEventSubtype
}

export type PoeCharacterSlainEvent = PoeClientLogTextEvent & {
  type: 'CharacterSlainEvent'
  character: string
  isMyCharacter: boolean
}

export type PoeClientLogEvent =
  | PoeZoneEntranceEvent
  | PoeInstanceConnectionEvent
  | PoeNPCEncounterEvent
  | PoeCharacterSlainEvent

interface PoeClientLogEventParser {
  parse(raw: string): PoeClientLogEvent | undefined
}

class ZoneEnteranceEventParser implements PoeClientLogEventParser {
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

class InstanceConnectionEventParser implements PoeClientLogEventParser {
  parse(raw: string): PoeInstanceConnectionEvent | undefined {
    if (raw.includes('] Connecting to instance server at')) {
      return {
        type: 'InstanceConnectionEvent',
        raw: raw,
        systemUptime: Number(raw.split(' ')[2]),
        server: raw.slice(raw.indexOf('at ') + 'at '.length, raw.length),
        time: new Date()
      }
    }
    return undefined
  }
}

let NPCEncounterMap = new Map<string, PoeNPCEventSubtype>([
  ['] Einhar, Beastmaster:', 'EinharEncounterEvent'],

  ['] Alva, Master Explorer:', 'AlvaEncounterEvent'],

  ['] Niko, Master of the Depths:', 'NikoEncounterEvent'],

  ['] Jun, Veiled Master:', 'JunEncounterEvent'],

  ['] Sister Cassia:', 'CassiaEncounterEvent'],

  ['] Strange Voice:', 'DeleriumMirrorEvent'],

  ['] Oshabi:', 'HarvestEncounterEvent'],

  ['] Tujen', 'ExpeditionTujenEncounterEvent'],
  ['] Rog', 'ExpeditionRogEncounterEvent'],
  ['] Dannig', 'ExpeditionDannigEncounterEvent'],
  ['] Gwennen', 'ExpeditionGwennenEncounterEvent']
])

class NPCEncounterEventParser implements PoeClientLogEventParser {
  parse(raw: string): PoeNPCEncounterEvent | undefined {
    for (let [key, value] of NPCEncounterMap) {
      if (raw.includes(key)) {
        return {
          type: 'NPCEncounterEvent',
          subtype: value,
          raw: raw,
          systemUptime: Number(raw.split(' ')[2]),
          time: new Date()
        }
      }
    }

    return undefined
  }
}

const characterSlainRegex = new RegExp('[.]* : (\\S+?) has been slain.')

class CharacterSlainEventParser implements PoeClientLogEventParser {
  parse(raw: string): PoeCharacterSlainEvent | undefined {
    const match = characterSlainRegex.exec(raw)
    const character = match == null ? null : match[1]

    if (character) {
      return {
        type: 'CharacterSlainEvent',
        raw: raw,
        character: character,
        isMyCharacter: false, // character === settingsService.currentCharacter ? true : false,
        systemUptime: Number(raw.split(' ')[2]),
        time: new Date()
      }
    } else if (raw.includes(' has been slain.')) {
      console.debug('Something probably went wrong, should check that out!')
    }

    return undefined
  }
}

//TODO TRADE PARSER?

export class PoeClientLogService {
  private logTail: Tail | null = null

  public logRaw$ = new Subject<string>()
  public logEvents$ = new Subject<PoeClientLogEvent>()

  public parsers: PoeClientLogEventParser[] = [
    new ZoneEnteranceEventParser(),
    new InstanceConnectionEventParser(),
    new NPCEncounterEventParser(),
    new CharacterSlainEventParser()
  ]

  constructor(tail: Tail | null = null) {
    if (!tail) {
      const path = this.getLogFilePath()
      if (path) {
        this.logTail = new Tail(path, { useWatchFile: true, fsWatchOptions: { interval: 1000 } })
        this.logTail.on('line', (line) => this.logRaw$.next(line))
      }
    } else {
      this.logTail = tail
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

    //TODO LOOK FOR CLIENT.TXT BASED ON SETTINGS

    for (const logPath of possiblePaths) {
      if (fs.existsSync(logPath)) {
        return logPath
      }
    }

    return null
  }
}
