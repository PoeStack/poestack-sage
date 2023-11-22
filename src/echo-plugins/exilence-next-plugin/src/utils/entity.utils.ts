import { PoeCharacter, PoeLeague, PoePartialStashTab } from 'sage-common'
import { LeagueEntry } from '../store/domains/league'
import { CharacterEntry } from '../store/domains/character'
import { StashTabEntry } from '../store/domains/stash-tab'
import { v4 as uuidv4 } from 'uuid'

export const toLeagueEntity = (league: PoeLeague) => {
  return LeagueEntry.create({
    uuid: uuidv4(),
    id: league.id,
    realm: league.realm!
  })
}

export const toCharacterEntity = (character: PoeCharacter) => {
  return CharacterEntry.create({
    id: character.id!,
    name: character.name!,
    realm: character.realm!,
    class: character.class!,
    level: character.level!,
    experience: character.experience!,
    league: character.league!,
    current: character.current!,
    inventory: character.inventory!,
    equipment: character.equipment!,
    jewels: character.jewels!
  })
}

export const toStashTab = (stash: PoePartialStashTab, league: string) => {
  return StashTabEntry.create({
    id: stash.id!,
    name: stash.name!,
    index: stash.index!,
    type: stash.type!,
    parent: stash.parent,
    folder: stash.metadata?.folder,
    public: stash.metadata?.public,
    league: league,
    metadata: stash.metadata
  })
}
