import {
  PoeClientLogEvent,
  PoeClientLogService,
  PoeGeneratingAreaEvent,
  PoeInstanceConnectionEvent,
  PoeZoneEntranceEvent
} from './poe-client-log-service'
import { PoeCharacter, PoeItem } from 'sage-common'
import { EchoPoeItem } from './poe-stash-service'
import { Subject, filter, map } from 'rxjs'

/*
Any generic
2023/11/22 15:27:09 106890565 ca3a6a7f [INFO Client 204] Connecting to instance server at 85.195.107.171:6112
2023/11/22 15:27:09 106890625 ca3a4dbd [DEBUG Client 204] Connect time to instance server was 34ms
2023/11/22 15:27:09 106890670 1186a0e0 [DEBUG Client 204] Generating level 70 area "MapWorldsInfestedValley" with seed 3743543658
2023/11/22 15:27:10 106892263 f22b6b6e [INFO Client 204] Tile hash: 2009098766
2023/11/22 15:27:10 106892263 f22b6b6f [INFO Client 204] Doodad hash: 647660025
2023/11/22 15:27:11 106892682 11871027 [DEBUG Client 204] Joined guild named log(sqrt(n)) with 9 members 
2023/11/22 15:27:11 106893272 cffb0716 [INFO Client 204] : You have entered Infested Valley.

-----------------------------------
ON STARTUP
2023/11/21 22:28:00 95351684 ca3a6a7f [INFO Client 204] Connecting to instance server at 85.195.96.35:6112
2023/11/21 22:28:00 95351724 ca3a4dbd [DEBUG Client 204] Connect time to instance server was 35ms
2023/11/21 22:28:00 95351850 1186a0e0 [DEBUG Client 204] Generating level 23 area "1_2_town" with seed 1
2023/11/21 22:28:04 95355892 f22b6b6e [INFO Client 204] Tile hash: 3760384659
2023/11/21 22:28:04 95355892 f22b6b6f [INFO Client 204] Doodad hash: 3788012064
2023/11/21 22:28:04 95356354 11871027 [DEBUG Client 204] Joined guild named log(sqrt(n)) with 9 members 
2023/11/21 22:28:05 95357107 cffb0716 [INFO Client 204] &: GUILD UPDATE: Emil er boss
2023/11/21 22:28:05 95357363 cffb0716 [INFO Client 204] : You have entered The Forest Encampment.
*/

export class PoeZoneTrackerService {
  private logEvents$: Subject<PoeClientLogEvent>

  public zones: Map<string, PoeZoneInstance> = new Map<string, PoeZoneInstance>() //TODO MAKE PRIVATE
  public currentZoneDelta?: PoeZoneDelta = undefined //TODO MAKE PRIVATE
  private previousZoneDelta?: PoeZoneDelta = undefined

  constructor(poeClientLogService: PoeClientLogService) {
    this.logEvents$ = poeClientLogService.logEvents$

    this.instanceConnectionEventsSubscribe()
    this.generatingAreaEventsSubscribe()
    this.zoneEntranceEventsSubscribe()
  }

  private instanceConnectionEventsSubscribe() {
    this.logEvents$
      .pipe(
        filter((e) => e.type == 'InstanceConnectionEvent'),
        map((e) => e as PoeInstanceConnectionEvent)
      )
      .subscribe((event) => {
        if (this.currentZoneDelta === undefined) {
          const zone: PoeZoneInstance = { zoneServer: event.server, zoneDeltas: [] }
          this.currentZoneDelta = {
            poeZoneInstance: zone,
            startLoadTime: event.systemUptime
          }
          return
        }

        if (!this.currentZoneDelta.enterSystemTime) {
          throw new Error(
            'Something went wrong. currentZoneDelta not instansiated correctly after InstanceConnectionEvent'
          )
        }

        const enterTime = this.currentZoneDelta.enterSystemTime
        this.currentZoneDelta.deltaTimeMs = event.systemUptime - enterTime
        this.currentZoneDelta.exitSystemTime = event.systemUptime
        this.currentZoneDelta.exitTime = event.time

        this.previousZoneDelta = this.currentZoneDelta

        const zone: PoeZoneInstance = { zoneServer: event.server, zoneDeltas: [] }
        const newZoneDelta: PoeZoneDelta = {
          poeZoneInstance: zone,
          startLoadTime: event.systemUptime
        }

        this.currentZoneDelta = newZoneDelta
      })
  }

  private generatingAreaEventsSubscribe() {
    this.logEvents$
      .pipe(
        filter((e) => e.type == 'GeneratingAreaEvent'),
        map((e) => e as PoeGeneratingAreaEvent)
      )
      .subscribe((event) => {
        if (this.currentZoneDelta === undefined) {
          throw new Error(
            'Something went wrong. currentZoneDelta not instansiated correctly in GeneratingAreaEvent'
          )
        }

        if (!this.currentZoneDelta.startLoadTime) {
          throw new Error(
            'Something went wrong. currentZoneDelta.startLoadTime not set correctly in GeneratingAreaEvent'
          )
        }

        this.currentZoneDelta.poeZoneInstance.areaLevel = event.areaLevel
        this.currentZoneDelta.poeZoneInstance.zoneSeed = event.seed
        this.currentZoneDelta.poeZoneInstance.areaTag = event.areaTag

        //Determine if currentZoneDelta is a revisit of an old zone
        //Has server, arealevel, seed, areatag and
        const zoneHash: string =
          this.currentZoneDelta.poeZoneInstance.zoneServer +
          '|' +
          this.currentZoneDelta.poeZoneInstance.areaTag +
          '|' +
          this.currentZoneDelta.poeZoneInstance.areaLevel.toString() +
          '|' +
          this.currentZoneDelta.poeZoneInstance.zoneSeed.toString()
        this.currentZoneDelta.poeZoneInstance.zoneHash = zoneHash

        const existingZone = this.zones.get(zoneHash)
        if (existingZone) {
          //TODO IF EXISTING ZONE IS FOUND, DO SOME LOGIC BASED ON DATE TO DETERMINE IF IT IS CLOSE ENOUGH
          existingZone.zoneDeltas.push(this.currentZoneDelta)
        } else {
          this.zones.set(zoneHash, this.currentZoneDelta.poeZoneInstance)
          this.currentZoneDelta.poeZoneInstance.zoneDeltas.push(this.currentZoneDelta)
        }
      })
  }

  private zoneEntranceEventsSubscribe() {
    this.logEvents$
      .pipe(
        filter((e) => e.type == 'ZoneEntranceEvent'),
        map((e) => e as PoeZoneEntranceEvent)
      )
      .subscribe((event) => {
        if (this.currentZoneDelta === undefined) {
          throw new Error(
            'Something went wrong. currentZoneDelta not instansiated correctly in ZoneEntranceEvent'
          )
        }

        if (!this.currentZoneDelta.startLoadTime) {
          throw new Error(
            'Something went wrong. currentZoneDelta.startLoadTime not set correctly in ZoneEntranceEvent'
          )
        }

        this.currentZoneDelta.poeZoneInstance.zoneName = event.location
        this.currentZoneDelta.enterTime = event.time
        this.currentZoneDelta.enterSystemTime = event.systemUptime

        const loadStart = this.currentZoneDelta.startLoadTime
        this.currentZoneDelta.doneLoadTime = event.systemUptime
        this.currentZoneDelta.deltaLoadTime = event.systemUptime - loadStart
        //TODO set isZoneHideoutOrTown based on location info

        //TODO Load and set character on old and new zoneDelta
      })
  }
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
  charactersEnter?: PoeCharacter
  charactersExit?: PoeCharacter
  poeZoneInstance: PoeZoneInstance

  //Character stats
  experience?: number
  normalizedExperience?: number
  inventoryDelta?: EchoPoeItem[]
  levelUp?: boolean
  death?: boolean

  //Zone stats
  enterTime?: Date
  exitTime?: Date
  startLoadTime?: number
  doneLoadTime?: number
  deltaLoadTime?: number
  enterSystemTime?: number
  exitSystemTime?: number
  deltaTimeMs?: number
  einharEncounter?: boolean
  junEcounter?: boolean
  alvaEncounter?: boolean
  nikoEncounter?: boolean
  deliriumEncounter?: boolean
}
