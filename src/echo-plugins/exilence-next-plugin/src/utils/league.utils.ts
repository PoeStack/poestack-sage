import { PoeCharacter, PoeLeague } from 'sage-common'

export function getCharacterLeagues(characters: PoeCharacter[]) {
  const distinctLeagues: PoeLeague[] = []
  characters.map((c) => {
    if (c.league) {
      const foundLeague = distinctLeagues.find((l) => l.id === c.league)
      if (!foundLeague) {
        distinctLeagues.push({ id: c.league!, realm: c.realm! })
      }
    }
  })
  return distinctLeagues
}
