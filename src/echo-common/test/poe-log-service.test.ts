
import { expect, test, afterEach, beforeEach } from '@jest/globals';
import {  filter, map } from 'rxjs'

import { Tail } from 'tail'
import path from 'path'
import * as fs from 'fs'

import { 
  PoeLogService,
  PoEZoneEntranceEvent,
  PoEInstanceConnectionEvent,
  PoECharacterSlainEvent,
  PoENPCEncounterEvent 
} from '../src/poe-log-service'

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


test('PoeLogService ZoneEnteranceEventParser test', async () => {
  
  const logService: PoeLogService = new PoeLogService(tail)

  let eventData: PoEZoneEntranceEvent[] = []

  logService.logEvents$.pipe(
    filter((e) => e.type == 'ZoneEntranceEvent'),
    map(e => e as PoEZoneEntranceEvent)
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

test('PoeLogService InstanceConnectionEventParser test', async () => {
  
  const logService: PoeLogService = new PoeLogService(tail)

  let eventData: PoEInstanceConnectionEvent[] = []

  logService.logEvents$.pipe(
    filter((e) => e.type == 'InstanceConnectionEvent'),
    map(e => e as PoEInstanceConnectionEvent)
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

test('PoeLogService CharacterSlainEventParser test', async () => {
  
  const logService: PoeLogService = new PoeLogService(tail)

  let eventData: PoECharacterSlainEvent[] = []

  logService.logEvents$.pipe(
    filter((e) => e.type == 'CharacterSlainEvent'),
    map(e => e as PoECharacterSlainEvent)
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


test('PoeLogService NPCEncounterEventParser test', async () => {
  
  const logService: PoeLogService = new PoeLogService(tail)

  let eventData: PoENPCEncounterEvent[] = []

  logService.logEvents$.pipe(
    filter((e) => e.type == 'NPCEncounterEvent'),
    map(e => e as PoENPCEncounterEvent)
  )
  .subscribe(data => {
    eventData.push(data)
  })

  fs.appendFileSync(file, '2023/11/17 14:30:04 1847032 f22b6b6e [INFO Client 200] Tile hash: 3760384659\n');
  fs.appendFileSync(file, '2023/11/17 09:03:32 372493 cffb0716 [INFO Client 200] Einhar, Beastmaster: Exile! You are a welcome omen.\n');
  fs.appendFileSync(file, '2023/11/17 14:32:31 1993666 327588d4 [INFO Client 200] [SHADER] Delay: OFF\n');

  return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
    expect(eventData[0].subtype).toBe('EinharEncounterEvent')
    expect(eventData.length).toBe(1)
  });
})