import { expect, test, afterEach, beforeEach } from '@jest/globals'
import { Observable, Subject } from 'rxjs'
import { Tail } from 'tail'
import path from 'path'
import * as fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { jest } from '@jest/globals'
import { PoeClientLogService } from '../src/poe-client-log-service'
import { PoeZoneDelta, PoeZoneTrackerService } from '../src/poe-zone-tracker-service'
import { EchoDirService, PoeCharacterService, SmartCacheEvent } from '../src'
import { PoeCharacter } from 'sage-common'
import { GggApi, GggHttpUtil } from 'ggg-api'
import { SmartCacheResultEvent } from '../src/smart-cache'

jest.setTimeout(30000)

let file: string
let tail: Tail

beforeEach(() => {
  const filename = uuidv4() + '.txt'
  file = path.join(process.cwd(), 'test', 'data', 'tmp', filename)

  if (!fs.existsSync(file)) {
    const fh = fs.openSync(file, 'a')
    fs.closeSync(fh)
  }

  tail = new Tail(file, { useWatchFile: true, fsWatchOptions: { interval: 5 } })
})

afterEach(() => {
  fs.unlinkSync(file)
  tail.unwatch()
})

const characterSubject = new Subject<SmartCacheEvent<PoeCharacter>>()

const myObservable = (name: string): Observable<SmartCacheEvent<PoeCharacter>> => {
  return characterSubject
}

test('PoeClientLogService InstanceConnectionEventParser test', async () => {
  const charFile = path.join(
    process.cwd(),
    'test',
    'data',
    'smart-cache-event-poecharacter',
    'character-one.json'
  )
  const val = fs.readFileSync(charFile).toString()
  const characterone = JSON.parse(val) as SmartCacheResultEvent<PoeCharacter>

  PoeCharacterService.prototype.character = myObservable

  const charService = new PoeCharacterService(new EchoDirService(), new GggApi(new GggHttpUtil()))

  const logService: PoeClientLogService = new PoeClientLogService(tail)
  const zoneTrackerService: PoeZoneTrackerService = new PoeZoneTrackerService(
    logService,
    charService
  )

  const exitedZones: PoeZoneDelta[] = []
  const enteredZones: PoeZoneDelta[] = []

  zoneTrackerService.zoneExited$.subscribe((delta) => exitedZones.push(delta))
  zoneTrackerService.zoneEntered$.subscribe((delta) => enteredZones.push(delta))

  fs.appendFileSync(
    file,
    '2023/11/24 14:19:12 170450675 ca3a6a7f [INFO Client 204] Connecting to instance server at 149.81.86.239:6112\n'
  )
  fs.appendFileSync(
    file,
    '2023/11/24 14:19:12 170450744 1186a0e0 [DEBUG Client 204] Generating level 60 area "HideoutShapersRealm" with seed 1\n'
  )
  fs.appendFileSync(
    file,
    '2023/11/24 14:19:13 170452042 cffb0716 [INFO Client 204] : You have entered Celestial Hideout.\n'
  )
  await new Promise((resolve) => setTimeout(resolve, 500))
  characterSubject.next(characterone)
  await new Promise((resolve) => setTimeout(resolve, 500))

  fs.appendFileSync(
    file,
    '2023/11/24 14:19:18 170457273 ca3a6a7f [INFO Client 204] Connecting to instance server at 37.61.215.67:6112\n'
  )
  fs.appendFileSync(
    file,
    '2023/11/24 14:19:19 170457369 1186a0e0 [DEBUG Client 204] Generating level 70 area "MapWorldsEstuary" with seed 201940244\n'
  )
  fs.appendFileSync(
    file,
    '2023/11/24 14:19:20 170458369 cffb0716 [INFO Client 204] Alva, Master Explorer: Just in time.\n'
  )
  fs.appendFileSync(
    file,
    '2023/11/24 14:19:20 170458369 cffb0716 [INFO Client 204] Einhar, Beastmaster: Ready, exile? It is time to hunt!\n'
  )
  fs.appendFileSync(
    file,
    '2023/11/24 14:19:20 170458369 cffb0716 [INFO Client 204] Niko, Master of the Depths: Good good good good.\n'
  )
  fs.appendFileSync(
    file,
    '2023/11/24 14:19:20 170458369 cffb0716 [INFO Client 204] Jun, Veiled Master: Has failure taught you nothing, General?\n'
  )
  fs.appendFileSync(
    file,
    '2023/11/24 14:19:20 170458369 cffb0716 [INFO Client 200] Strange Voice: They are using you. Everyone is simply using you.\n'
  )
  fs.appendFileSync(
    file,
    '2023/11/24 14:19:20 170458369 cffb0716 [INFO Client 204] Sister Cassia: Oh!\n'
  )
  fs.appendFileSync(
    file,
    '2023/11/24 14:19:20 170458369 cffb0716 [INFO Client 204] Oshabi: This way, Exile.\n'
  )
  fs.appendFileSync(
    file,
    "2023/11/24 14:19:20 170458369 cffb0716 [INFO Client 204] Rog: You're alive!\n"
  )
  fs.appendFileSync(
    file,
    '2023/11/24 14:19:20 170458369 cffb0716 [INFO Client 204] Gwennen, the Gambler: Hello again, local!\n'
  )
  fs.appendFileSync(
    file,
    "2023/11/24 14:19:20 170458369 cffb0716 [INFO Client 204] Tujen, the Haggler: Come on now, don't got all day!\n"
  )
  fs.appendFileSync(
    file,
    "2023/11/24 14:19:20 170458369 cffb0716 [INFO Client 204] Dannig: I've got another one for ya!\n"
  )
  fs.appendFileSync(
    file,
    '2023/11/24 14:19:22 170460699 cffb0716 [INFO Client 204] : You have entered Estuary.\n'
  )

  await new Promise((resolve) => setTimeout(resolve, 500))

  const charactertwo = JSON.parse(
    JSON.stringify(characterone)
  ) as SmartCacheResultEvent<PoeCharacter>

  if (characterone.result?.experience) {
    charactertwo.result!.experience = characterone.result.experience + 1
    characterSubject.next(charactertwo)
  } else {
    expect(true).toBeFalsy() //characterone.result should be set
  }

  await new Promise((resolve) => setTimeout(resolve, 500))
  //

  fs.appendFileSync(
    file,
    '2023/11/24 14:19:27 170466195 ca3a6a7f [INFO Client 204] Connecting to instance server at 149.81.86.239:6112\n'
  )

  fs.appendFileSync(
    file,
    '2023/11/24 14:19:27 170466262 1186a0e0 [DEBUG Client 204] Generating level 60 area "HideoutShapersRealm" with seed 1\n'
  )
  fs.appendFileSync(
    file,
    '2023/11/24 14:19:29 170467664 cffb0716 [INFO Client 204] : You have entered Celestial Hideout.\n'
  )

  await new Promise((resolve) => setTimeout(resolve, 500))

  if (charactertwo.result?.level) {
    const characterthree = JSON.parse(
      JSON.stringify(charactertwo)
    ) as SmartCacheResultEvent<PoeCharacter>

    characterthree.result!.level = charactertwo.result.level + 1
    characterSubject.next(characterthree)
  } else {
    expect(true).toBeFalsy() //characterone.result should be set
  }

  await new Promise((resolve) => setTimeout(resolve, 500))

  //
  return await new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
    expect(enteredZones[0].poeZoneInstance.zoneServer).toBe('149.81.86.239:6112')
    expect(enteredZones[0].poeZoneInstance.zoneName).toBe('Celestial Hideout')
    expect(enteredZones[0].poeZoneInstance.areaLevel).toBe(60)
    expect(enteredZones[0].poeZoneInstance.zoneSeed).toBe(1)
    expect(enteredZones[0].poeZoneInstance.areaTag).toBe('HideoutShapersRealm')
    expect(enteredZones[0].poeZoneInstance.isZoneHideoutOrTown).toBe(true)
    expect(enteredZones[0].startLoadTime).toBe(170450675)
    expect(enteredZones[0].doneLoadTime).toBe(170452042)
    expect(enteredZones[0].deltaLoadTime).toBe(170452042 - 170450675)
    expect(enteredZones[0].enterSystemTime).toBe(170452042)
    expect(enteredZones[0].exitSystemTime).toBe(170457273)
    expect(enteredZones[0].deltaTimeMs).toBe(170457273 - 170452042)

    expect(enteredZones[0].characterDelta?.experience).toBe(1)
    expect(enteredZones[0].characterDelta?.characterEnter?.name).toBe('characterone')
    expect(enteredZones[0]).toBe(exitedZones[0])

    expect(enteredZones[1].poeZoneInstance.zoneServer).toBe('37.61.215.67:6112')
    expect(enteredZones[1].poeZoneInstance.zoneName).toBe('Estuary')
    expect(enteredZones[1].poeZoneInstance.areaLevel).toBe(70)
    expect(enteredZones[1].poeZoneInstance.zoneSeed).toBe(201940244)
    expect(enteredZones[1].poeZoneInstance.areaTag).toBe('MapWorldsEstuary')
    expect(enteredZones[1].poeZoneInstance.isZoneHideoutOrTown).toBe(false)
    expect(enteredZones[1].startLoadTime).toBe(170457273)
    expect(enteredZones[1].doneLoadTime).toBe(170460699)
    expect(enteredZones[1].deltaLoadTime).toBe(170460699 - 170457273)
    expect(enteredZones[1].enterSystemTime).toBe(170460699)
    expect(enteredZones[1].exitSystemTime).toBe(170466195)
    expect(enteredZones[1].deltaTimeMs).toBe(170466195 - 170460699)

    expect(enteredZones[1].characterDelta?.levelUp).toBe(true)
    expect(enteredZones[1].characterDelta?.characterEnter?.name).toBe('characterone')

    expect(enteredZones[1].alvaEncounter).toBe(true)
    expect(enteredZones[1].junEcounter).toBe(true)
    expect(enteredZones[1].nikoEncounter).toBe(true)
    expect(enteredZones[1].einharEncounter).toBe(true)
    expect(enteredZones[1].deliriumEncounter).toBe(true)
    expect(enteredZones[1].harvestEncounter).toBe(true)
    expect(enteredZones[1].blightEncounter).toBe(true)
    expect(enteredZones[1].expeditionDannigEncounter).toBe(true)
    expect(enteredZones[1].expeditionEncounter).toBe(true)
    expect(enteredZones[1].expeditionGwennenEncounter).toBe(true)
    expect(enteredZones[1].expeditionTujenEncounter).toBe(true)
    expect(enteredZones[1].expeditionRogEncounter).toBe(true)

    expect(enteredZones[1]).toBe(exitedZones[1])
    expect(exitedZones.length).toBe(2)

    expect(enteredZones[2].poeZoneInstance.zoneServer).toBe('149.81.86.239:6112')
    expect(enteredZones[2].poeZoneInstance.zoneName).toBe('Celestial Hideout')
    expect(enteredZones[2].poeZoneInstance.areaLevel).toBe(60)
    expect(enteredZones[2].poeZoneInstance.zoneSeed).toBe(1)
    expect(enteredZones[2].poeZoneInstance.areaTag).toBe('HideoutShapersRealm')
    expect(enteredZones[2].poeZoneInstance.isZoneHideoutOrTown).toBe(true)
    expect(enteredZones[2].startLoadTime).toBe(170466195)
    expect(enteredZones[2].doneLoadTime).toBe(170467664)
    expect(enteredZones[2].deltaLoadTime).toBe(170467664 - 170466195)
    expect(enteredZones[2].enterSystemTime).toBe(170467664)
    expect(enteredZones[2].exitSystemTime).toBe(undefined)
    expect(enteredZones[2].deltaTimeMs).toBe(undefined)

    expect(enteredZones[2].characterDelta?.characterEnter?.name).toBe('characterone')
    expect(enteredZones[2].characterDelta?.characterExit).toBe(undefined)
    expect(enteredZones.length).toBe(3)
  })
})
