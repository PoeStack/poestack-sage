import {
  PoeClientLogEvent,
  PoeClientLogService,
  PoeInstanceConnectionEvent
} from './poe-client-log-service'
import { PoeCharacter, PoeItem } from 'sage-common'
import { Subject, Subscription, map } from 'rxjs'
import { PoeCharacterService } from './poe-character-service'

export class PoeZoneTrackerService {
  private logEvents$: Subject<PoeClientLogEvent>

  private zones: Map<string, PoeZoneInstance> = new Map<string, PoeZoneInstance>()
  private currentZoneDelta?: PoeZoneDelta = undefined
  private previousZoneDelta?: PoeZoneDelta = undefined

  public zoneEntered$ = new Subject<PoeZoneDelta>()
  public zoneExited$ = new Subject<PoeZoneDelta>()

  public zoneTrackerErrors$ = new Subject<PoeZoneTrackerError>()

  private characterSubscription?: Subscription

  constructor(
    poeClientLogService: PoeClientLogService,
    private characterService: PoeCharacterService | undefined = undefined
  ) {
    this.logEvents$ = poeClientLogService.logEvents$

    this.instanceConnectionEventSubscribe()
    this.generatingAreaEventSubscribe()
    this.zoneEntranceEventSubscribe()
    this.npcEncounterEventSubscriber()
    this.characterSlainEventSubscriber()
  }

  private instanceConnectionEventSubscribe() {
    this.logEvents$.subscribe((event) => {
      if (event.type != 'InstanceConnectionEvent') {
        return
      }

      if (this.currentZoneDelta === undefined) {
        const zone: PoeZoneInstance = { zoneServer: event.server, zoneDeltas: [] }
        const newZoneDelta = this.initializeZoneDelta(zone, event)
        this.currentZoneDelta = newZoneDelta
        return
      }

      if (!this.currentZoneDelta.enterSystemTime) {
        this.zoneTrackerErrors$.next({
          description: 'currentZoneDelta not instansiated correctly after InstanceConnectionEvent',
          time: new Date()
        })
        return
      }

      const enterTime = this.currentZoneDelta.enterSystemTime
      this.currentZoneDelta.deltaTimeMs = event.systemUptime - enterTime
      this.currentZoneDelta.exitSystemTime = event.systemUptime
      this.currentZoneDelta.exitTime = event.time

      this.previousZoneDelta = this.currentZoneDelta

      const zone: PoeZoneInstance = { zoneServer: event.server, zoneDeltas: [] }
      const newZoneDelta = this.initializeZoneDelta(zone, event)

      this.currentZoneDelta = newZoneDelta
    })
  }

  private initializeZoneDelta(
    zone: PoeZoneInstance,
    event: PoeInstanceConnectionEvent
  ): PoeZoneDelta {
    return {
      poeZoneInstance: zone,
      startLoadTime: event.systemUptime,
      einharEncounter: false,
      junEcounter: false,
      nikoEncounter: false,
      alvaEncounter: false,
      deliriumEncounter: false,
      harvestEncounter: false,
      expeditionDannigEncounter: false,
      expeditionEncounter: false,
      expeditionGwennenEncounter: false,
      expeditionRogEncounter: false,
      expeditionTujenEncounter: false,
      blightEncounter: false
    }
  }

  private generatingAreaEventSubscribe() {
    this.logEvents$.subscribe((event) => {
      if (event.type != 'GeneratingAreaEvent') {
        return
      }

      if (this.currentZoneDelta === undefined) {
        this.zoneTrackerErrors$.next({
          description: 'currentZoneDelta not instansiated correctly in GeneratingAreaEvent',
          time: new Date()
        })
        return
      }

      if (!this.currentZoneDelta.startLoadTime) {
        this.zoneTrackerErrors$.next({
          description: 'currentZoneDelta.startLoadTime not set correctly in GeneratingAreaEvent',
          time: new Date()
        })
        return
      }

      this.currentZoneDelta.poeZoneInstance.areaLevel = event.areaLevel
      this.currentZoneDelta.poeZoneInstance.zoneSeed = event.seed
      this.currentZoneDelta.poeZoneInstance.areaTag = event.areaTag

      //Determine if currentZoneDelta is a revisit of an old zone
      //Has server, arealevel, seed, areatag and
      let zoneHash: string =
        this.currentZoneDelta.poeZoneInstance.zoneServer +
        '|' +
        this.currentZoneDelta.poeZoneInstance.areaTag +
        '|' +
        this.currentZoneDelta.poeZoneInstance.areaLevel.toString() +
        '|' +
        this.currentZoneDelta.poeZoneInstance.zoneSeed.toString()

      if (
        event.areaTag.toLowerCase().includes('hideout') ||
        event.areaTag.toLowerCase().includes('town')
      ) {
        this.currentZoneDelta.poeZoneInstance.isZoneHideoutOrTown = true
        zoneHash = zoneHash + '|' + event.time.getTime().toString()
      } else {
        this.currentZoneDelta.poeZoneInstance.isZoneHideoutOrTown = false
      }

      this.currentZoneDelta.poeZoneInstance.zoneHash = zoneHash

      const existingZone = this.zones.get(zoneHash)
      if (existingZone) {
        this.currentZoneDelta.poeZoneInstance = existingZone
        //TODO IF EXISTING ZONE IS FOUND, DO SOME LOGIC BASED ON DATE TO DETERMINE IF IT IS CLOSE ENOUGH
        existingZone.zoneDeltas.push(this.currentZoneDelta)
        this.zones.set(zoneHash, existingZone)
      } else {
        this.currentZoneDelta.poeZoneInstance.zoneDeltas.push(this.currentZoneDelta)
        this.zones.set(zoneHash, this.currentZoneDelta.poeZoneInstance)
      }
    })
  }

  private zoneEntranceEventSubscribe() {
    this.logEvents$.subscribe((event) => {
      if (event.type != 'ZoneEntranceEvent') {
        return
      }

      if (this.currentZoneDelta === undefined) {
        this.zoneTrackerErrors$.next({
          description: 'currentZoneDelta not instansiated correctly in ZoneEntranceEvent',
          time: new Date()
        })
        return
      }

      if (!this.currentZoneDelta.startLoadTime) {
        this.zoneTrackerErrors$.next({
          description: 'currentZoneDelta.startLoadTime not set correctly in ZoneEntranceEvent',
          time: new Date()
        })
        return
      }

      this.currentZoneDelta.poeZoneInstance.zoneName = event.location
      this.currentZoneDelta.enterTime = event.time
      this.currentZoneDelta.enterSystemTime = event.systemUptime

      const loadStart = this.currentZoneDelta.startLoadTime
      this.currentZoneDelta.doneLoadTime = event.systemUptime
      this.currentZoneDelta.deltaLoadTime = event.systemUptime - loadStart

      if (this.characterService != undefined) {
        const charName = 'BlaesendeBruno' //TODO from settings
        this.characterSubscription = this.characterService
          .character(charName) //TODO Find a solution to call this function to get non-stale data, probably more intelligent rate-limiter
          .pipe(
            map((e) => {
              if (e.type != 'result') {
                return
              }
              const char = e.result

              if (char == undefined) {
                this.zoneTrackerErrors$.next({
                  description: 'character not found for ' + charName,
                  time: new Date()
                })
                return
              }
              return char
            })
          )
          .subscribe((char) => {
            if (this.currentZoneDelta && char != undefined) {
              this.currentZoneDelta.characterDelta = {
                characterEnter: char,
                levelUp: false,
                death: false,
                inventoryAdded: [],
                inventoryRemoved: []
              }

              if (this.previousZoneDelta && this.previousZoneDelta.characterDelta?.characterEnter) {
                this.previousZoneDelta.characterDelta.characterExit = char
                const success = this.setCharacterDelta(
                  this.previousZoneDelta.characterDelta.characterEnter,
                  this.previousZoneDelta.characterDelta.characterExit,
                  this.previousZoneDelta
                )

                if (!success) {
                  this.characterSubscription?.unsubscribe()
                  return
                }

                this.zoneExited$.next(this.previousZoneDelta)
              }
              this.zoneEntered$.next(this.currentZoneDelta)
            }
            this.characterSubscription?.unsubscribe()
          })
      } else {
        if (this.previousZoneDelta) {
          this.zoneExited$.next(this.previousZoneDelta)
        }
        this.zoneEntered$.next(this.currentZoneDelta)
      }
    })
  }

  private setCharacterDelta(
    enter: PoeCharacter,
    exit: PoeCharacter,
    zoneDelta: PoeZoneDelta
  ): boolean {
    if (!zoneDelta.characterDelta) {
      this.zoneTrackerErrors$.next({
        description: 'Attempt to call setCharacterDelta without delta initialized',
        time: new Date()
      })
      return false
    }

    if (enter.level && exit.level) {
      zoneDelta.characterDelta.enterLevel = enter.level
      zoneDelta.characterDelta.exitLevel = exit.level
      zoneDelta.characterDelta.levelUp = exit.level > enter.level ? true : false
    }

    if (exit.experience != undefined && enter.experience != undefined) {
      zoneDelta.characterDelta.experience = exit.experience - enter.experience
    }

    const enterMap = itemIdMap(enter.inventory ?? [])
    const exitMap = itemIdMap(exit.inventory ?? [])

    const added: PoeItem[] = []
    const removed: PoeItem[] = []
    enterMap.forEach((item) => {
      if (item.id && !exitMap.has(item.id)) {
        removed.push(item)
      }
    })

    exitMap.forEach((item) => {
      if (item.id && !enterMap.has(item.id)) {
        added.push(item)
      }
    })

    zoneDelta.characterDelta.inventoryAdded = added
    zoneDelta.characterDelta.inventoryRemoved = removed

    return true
  }

  private npcEncounterEventSubscriber() {
    this.logEvents$.subscribe((event) => {
      if (event.type != 'NPCEncounterEvent') {
        return
      }

      if (this.currentZoneDelta == undefined) {
        this.zoneTrackerErrors$.next({
          description: 'NPC Encountered without currentZone set, probably local chat turned off',
          time: new Date()
        })
        return
      }
      switch (event.subtype) {
        case 'AlvaEncounterEvent':
          this.currentZoneDelta.alvaEncounter = true
          break
        case 'CassiaEncounterEvent':
          this.currentZoneDelta.blightEncounter = true
          break
        case 'DeliriumMirrorEvent':
          this.currentZoneDelta.deliriumEncounter = true
          break
        case 'EinharEncounterEvent':
          this.currentZoneDelta.einharEncounter = true
          break
        case 'HarvestEncounterEvent':
          this.currentZoneDelta.harvestEncounter = true
          break
        case 'JunEncounterEvent':
          this.currentZoneDelta.junEcounter = true
          break
        case 'NikoEncounterEvent':
          this.currentZoneDelta.nikoEncounter = true
          break
        case 'ExpeditionDannigEncounterEvent':
          this.currentZoneDelta.expeditionDannigEncounter = true
          this.currentZoneDelta.expeditionEncounter = true
          break
        case 'ExpeditionGwennenEncounterEvent':
          this.currentZoneDelta.expeditionGwennenEncounter = true
          this.currentZoneDelta.expeditionEncounter = true
          break
        case 'ExpeditionRogEncounterEvent':
          this.currentZoneDelta.expeditionRogEncounter = true
          this.currentZoneDelta.expeditionEncounter = true
          break
        case 'ExpeditionTujenEncounterEvent':
          this.currentZoneDelta.expeditionTujenEncounter = true
          this.currentZoneDelta.expeditionEncounter = true
          break
      }
    })
  }

  private characterSlainEventSubscriber() {
    this.logEvents$.pipe(
      map((e) => {
        if (e.type != 'CharacterSlainEvent') {
          return
        }

        if (this.currentZoneDelta == undefined) {
          this.zoneTrackerErrors$.next({
            description:
              'character ' +
              e.character +
              ' slain without currentZone set, probably local chat turned off',
            time: new Date()
          })
          return
        }

        if (e.isMyCharacter && this.currentZoneDelta.characterDelta) {
          this.currentZoneDelta.characterDelta.death = true
        }
      })
    )
  }
}

function itemIdMap(items: PoeItem[]) {
  const map = new Map<string, PoeItem>()
  items.forEach((item) => {
    if (item.id != undefined) {
      map.set(item.id, item)
    } else {
      console.log('No id for item, something seriously wrong')
    }
  })
  return map
}

//For logging
function PoeZoneDeltaToString(delta: PoeZoneDelta) {
  let str = ''

  str = str + '----' + delta.poeZoneInstance.zoneHash + '----\n'
  str = str + ' Area:' + delta.poeZoneInstance.zoneName + '\n'
  str = str + ' Town:' + delta.poeZoneInstance.isZoneHideoutOrTown + '\n'
  str = str + ' Level:' + delta.poeZoneInstance.areaLevel?.toString() + '\n'
  str = str + ' Deltas:' + delta.poeZoneInstance.zoneDeltas.length.toString() + '\n'
  str = str + '\n'

  str = str + '    --Delta--' + '\n'
  if (delta.deltaLoadTime) {
    str = str + '   LoadTime:' + delta.deltaLoadTime.toString() + '\n'
  }
  if (delta.enterTime) {
    str = str + '   Enter at:' + delta.enterTime.toISOString() + '\n'
  }
  if (delta.deltaTimeMs) {
    str = str + '   Time in zone:' + delta.deltaTimeMs.toString() + '\n'
  }
  if (delta.characterDelta?.experience) {
    str = str + '   Experience delta: ' + delta.characterDelta?.experience + '\n'
  }
  if (delta.characterDelta?.levelUp) {
    str = str + '   Level up: True\n'
  }

  if ((delta.characterDelta?.inventoryAdded.length ?? 0) > 0) {
    str =
      str + '  ---Items added:' + delta.characterDelta!.inventoryAdded.length.toString() + '---\n'
    delta.characterDelta!.inventoryAdded.forEach((item) => {
      str = str + '      ' + item.typeLine + '\n'
    })
  }

  if ((delta.characterDelta?.inventoryRemoved.length ?? 0) > 0) {
    str =
      str +
      '  ---Items removed:' +
      delta.characterDelta!.inventoryRemoved.length.toString() +
      '---\n'
    delta.characterDelta!.inventoryRemoved.forEach((item) => {
      str = str + '      ' + item.typeLine + '\n'
    })
  }

  str = str + '\n'

  return str
}

export type PoeZoneInstance = {
  zoneName?: string
  isZoneHideoutOrTown?: boolean
  zoneServer: string
  zoneSeed?: number
  areaLevel?: number
  areaTag?: string
  zoneHash?: string
  zoneDeltas: PoeZoneDelta[]
}

export type PoeZoneDelta = {
  poeZoneInstance: PoeZoneInstance

  characterDelta?: PoeZoneDeltaCharacterDelta

  //Zone stats
  enterTime?: Date
  exitTime?: Date
  startLoadTime?: number
  doneLoadTime?: number
  deltaLoadTime?: number
  enterSystemTime?: number
  exitSystemTime?: number
  deltaTimeMs?: number
  einharEncounter: boolean
  junEcounter: boolean
  alvaEncounter: boolean
  nikoEncounter: boolean
  deliriumEncounter: boolean
  blightEncounter: boolean
  expeditionEncounter: boolean
  expeditionRogEncounter: boolean
  expeditionDannigEncounter: boolean
  expeditionGwennenEncounter: boolean
  expeditionTujenEncounter: boolean
  harvestEncounter: boolean
}

export type PoeZoneDeltaCharacterDelta = {
  characterEnter?: PoeCharacter
  characterExit?: PoeCharacter
  experience?: number
  normalizedExperience?: number
  inventoryAdded: PoeItem[]
  inventoryRemoved: PoeItem[]
  enterLevel?: number
  exitLevel?: number
  levelUp: boolean
  death: boolean
}

export type PoeZoneTrackerError = {
  description: string
  time: Date
}
