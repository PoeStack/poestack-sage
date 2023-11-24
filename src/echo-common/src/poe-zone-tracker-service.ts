import { PoeClientLogEvent, PoeClientLogService, PoeInstanceConnectionEvent } from "./poe-client-log-service";
import { PoeCharacter, PoeItem } from 'sage-common'
import { EchoPoeItem } from './poe-stash-service'
import { Subject, filter, map } from "rxjs";

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

  private zones: PoeZoneInstance[] = []
  private currentZoneDelta?: PoeZoneDelta = undefined

  constructor(poeClientLogService: PoeClientLogService) {
    this.logEvents$ = poeClientLogService.logEvents$



  }


  private instanceConnectionEvents() {
    this.logEvents$.pipe(
      filter((e) => (e.type == 'InstanceConnectionEvent')),
      map((e) => e as PoeInstanceConnectionEvent)
    ).subscribe((event) => {

      if (this.currentZoneDelta === undefined) {
        let zone: PoeZoneInstance = { zoneServer: event.server,   }
        let zoneDelta: PoeZoneDelta = { poeZoneInstance: zone }
        zone.zoneDeltas?.push(zoneDelta)
        
        this.currentZoneDelta = zoneDelta
      } else {
        if (this.currentZoneDelta.poeZoneStats && this.currentZoneDelta.poeZoneStats.enterSystemTime) {
          this.currentZoneDelta.poeZoneStats.exitTime = event.time
          this.currentZoneDelta.poeZoneStats.exitSystemTime = event.systemUptime

          this.currentZoneDelta.poeZoneStats.deltaTimeMs = this.currentZoneDelta.poeZoneStats.enterSystemTime - event.systemUptime
        } else {
          //I THINK THIS HAPPENS IF LOCAL CHAT IS DISABLED
          throw new Error("Something went wrong. currentZoneDelta not instansiated correctly after InstanceConnectionEvent")
        }
         
      }


    
    })
  }

}

export type PoeZoneInstance = {
  zoneName?: string
  isZoneHideoutOrTown?: boolean
  zoneServer?: string
  zoneSeed?: number
  areaLevel?: number
  zoneDeltas?: PoeZoneDelta[]
  
}

export type PoeZoneDelta = {
  charactersEnter?: PoeCharacter
  charactersExit?: PoeCharacter
  characterDelta?: PoeZoneCharacterDeltaStats
  poeZoneStats?: PoeZoneStats
  poeZoneInstance?: PoeZoneInstance
}

export type PoeZoneStats = {
  enterTime?: Date
  exitTime?: Date
  enterSystemTime?: number
  exitSystemTime?: number
  deltaTimeMs?: number
  einharEncounter?: boolean
  junEcounter?: boolean
  alvaEncounter?: boolean
  nikoEncounter?: boolean
  deleriumEncounter?: boolean
}

export type PoeZoneCharacterDeltaStats = {
  experience?: number
  normalizedExperience?: number
  inventoryDelta?: EchoPoeItem[]
  levelUp?: boolean
  death?: boolean
}