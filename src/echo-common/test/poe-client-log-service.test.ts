
import { expect, test, afterEach, beforeEach } from '@jest/globals';
import {  filter, map } from 'rxjs'

import { Tail } from 'tail'
import path from 'path'
import * as fs from 'fs'

import { 
  PoeClientLogService,
  PoeZoneEntranceEvent,
  PoeInstanceConnectionEvent,
  PoeCharacterSlainEvent,
  PoeNPCEncounterEvent 
} from '../src/poe-client-log-service'

let file: string
let tail: Tail

beforeEach(() => {
  const filename = Math.floor(Math.random() * 99999999) + '.txt'
  file = path.join(
    process.cwd(),
    'test',
    'data',
    filename
  )

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

test('PoeClientLogService ZoneEnteranceEventParser test', async () => {
  
  const logService: PoeClientLogService = new PoeClientLogService(tail)

  let eventData: PoeZoneEntranceEvent[] = []

  logService.logEvents$.pipe(
    filter((e) => e.type == 'ZoneEntranceEvent'),
    map(e => e as PoeZoneEntranceEvent)
  )
  .subscribe(data => {
    eventData.push(data)
  })

  fs.appendFileSync(file, '2023/11/17 14:31:13 1915613 cffb0716 [INFO Client 200] : You have entered Lioneye\'s Watch.\n');

  fs.appendFileSync(file, '2023/11/17 14:30:04 1847032 f22b6b6e [INFO Client 200] Tile hash: 3760384659\n');

  fs.appendFileSync(file, '2023/11/17 14:31:13 1915615 cffb0716 [INFO Client 200] : You have entered Lsioneye\'s Watch.\n');

  return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
    expect(eventData[0].location).toBe('Lioneye\'s Watch')
    expect(eventData[0].systemUptime).toBe(1915613)
  
    
    expect(eventData[1].location).toBe('Lsioneye\'s Watch')
    expect(eventData[1].systemUptime).toBe(1915615)

    expect(eventData.length).toBe(2)
  });
})

test('PoeClientLogService InstanceConnectionEventParser test', async () => {
  
  const logService: PoeClientLogService = new PoeClientLogService(tail)

  let eventData: PoeInstanceConnectionEvent[] = []

  logService.logEvents$.pipe(
    filter((e) => e.type == 'InstanceConnectionEvent'),
    map(e => e as PoeInstanceConnectionEvent)
  )
  .subscribe(data => {
    eventData.push(data)
  })

  fs.appendFileSync(file, '2023/11/17 14:32:31 1993666 ca3a6a7f [INFO Client 200] Connecting to instance server at 37.61.215.13:6112\n');

  fs.appendFileSync(file, '2023/11/17 14:30:04 1847032 f22b6b6e [INFO Client 200] Tile hash: 3760384659\n');

  fs.appendFileSync(file, '2023/11/17 14:32:31 1993666 327588d4 [INFO Client 200] [SHADER] Delay: OFF\n');

  return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
    expect(eventData[0].server).toBe('37.61.215.13:6112')
    expect(eventData.length).toBe(1)
  });
})

test('PoeClientLogService CharacterSlainEventParser test', async () => {
  
  const logService: PoeClientLogService = new PoeClientLogService(tail)

  let eventData: PoeCharacterSlainEvent[] = []

  logService.logEvents$.pipe(
    filter((e) => e.type == 'CharacterSlainEvent'),
    map(e => e as PoeCharacterSlainEvent)
  )
  .subscribe(data => {
    eventData.push(data)
  })

  fs.appendFileSync(file, '2023/11/17 14:32:31 1993666 ca3a6a7f [INFO Client 200] Connecting to instance server at 37.61.215.13:6112\n');

  fs.appendFileSync(file, '2023/11/17 14:31:37 1940444 cffb0716 [INFO Client 200] : tertsdfwersd has been slain.\n');

  fs.appendFileSync(file, '2023/11/17 14:32:31 1993666 327588d4 [INFO Client 200] [SHADER] Delay: OFF\n');

  fs.appendFileSync(file, '2023/11/17 14:31:37 1940444 cffb0716 [INFO Client 200] : someꞨꞨstrange has been slain.\n');

  fs.appendFileSync(file, '2023/11/17 14:31:37 1940444 cffb0716 [INFO Client 200] : some福福strange has been slain.\n');

  fs.appendFileSync(file, '2023/11/17 14:31:37 1940444 cffb0716 [INFO Client 200] : someさくらstrange has been slain.\n');

  fs.appendFileSync(file, '2023/11/17 14:31:37 1940444 cffb0716 [INFO Client 200] : someёшкаstrange has been slain.\n');


  return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
    //TODO TEST WITH SETTINGS FOR MYCHARACTER MATCH
    expect(eventData[0].character).toBe('tertsdfwersd')

    expect(eventData[1].character).toBe('someꞨꞨstrange')

    expect(eventData[2].character).toBe('some福福strange')

    expect(eventData[3].character).toBe('someさくらstrange')

    expect(eventData[4].character).toBe('someёшкаstrange')
  });
})

test('PoeClientLogService NPCEncounterEventParser test', async () => {
  
  const logService: PoeClientLogService = new PoeClientLogService(tail)

  let eventData: PoeNPCEncounterEvent[] = []

  logService.logEvents$.pipe(
    filter((e) => e.type == 'NPCEncounterEvent'),
    map(e => e as PoeNPCEncounterEvent)
  )
  .subscribe(data => {
    eventData.push(data)
  })

  fs.appendFileSync(file, '2023/11/17 14:30:04 1847032 f22b6b6e [INFO Client 200] Tile hash: 3760384659\n');
  fs.appendFileSync(file, '2023/11/17 09:03:32 372493 cffb0716 [INFO Client 200] Einhar, Beastmaster: Exile! You are a welcome omen.\n');
  fs.appendFileSync(file, '2023/11/21 22:39:42 96053513 cffb0716 [INFO Client 204] Alva, Master Explorer: Just in time.\n');
  fs.appendFileSync(file, '2023/11/21 22:53:17 96868783 cffb0716 [INFO Client 204] Niko, Master of the Depths: Good good good good.\n');
  fs.appendFileSync(file, '2023/11/22 10:27:30 98110186 cffb0716 [INFO Client 204] Jun, Veiled Master: Surely you want the thrill of a free for all, warrior!\n');
  fs.appendFileSync(file, '2023/11/22 10:42:06 98986720 cffb0716 [INFO Client 204] Sister Cassia: Oh!\n');
  fs.appendFileSync(file, '2023/11/17 09:01:26 247170 cffb0716 [INFO Client 200] Strange Voice: They are using you. Everyone is simply using you.\n');
  fs.appendFileSync(file, '2023/11/22 10:44:06 99106518 cffb0716 [INFO Client 204] Oshabi: This way, Exile.\n');
  fs.appendFileSync(file, '2023/11/22 15:26:46 106868352 cffb0716 [INFO Client 204] Tujen, the Haggler: Come on now, don\'t got all day!\n');
  fs.appendFileSync(file, '2023/11/22 15:27:31 106912869 cffb0716 [INFO Client 204] Gwennen, the Gambler: Finally! Come on!\n');
  fs.appendFileSync(file, '2023/11/22 15:33:18 107259420 cffb0716 [INFO Client 204] Rog: I\'ve got another one for ya!\n');
  fs.appendFileSync(file, '2023/11/22 15:33:18 107259420 cffb0716 [INFO Client 204] Dannig: I\'ve got another one for ya!\n');
  fs.appendFileSync(file, '2023/11/17 14:32:31 1993666 327588d4 [INFO Client 200] [SHADER] Delay: OFF\n');

  return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
    expect(eventData[0].subtype).toBe('EinharEncounterEvent')
    expect(eventData[1].subtype).toBe('AlvaEncounterEvent')
    expect(eventData[2].subtype).toBe('NikoEncounterEvent')
    expect(eventData[3].subtype).toBe('JunEncounterEvent')
    expect(eventData[4].subtype).toBe('CassiaEncounterEvent')
    expect(eventData[5].subtype).toBe('DeleriumMirrorEvent')
    expect(eventData[6].subtype).toBe('HarvestEncounterEvent')
    expect(eventData[7].subtype).toBe('ExpeditionTujenEncounterEvent')
    expect(eventData[8].subtype).toBe('ExpeditionGwennenEncounterEvent')
    expect(eventData[9].subtype).toBe('ExpeditionRogEncounterEvent')
    expect(eventData[10].subtype).toBe('ExpeditionDannigEncounterEvent')
    expect(eventData.length).toBe(11)
  });
})