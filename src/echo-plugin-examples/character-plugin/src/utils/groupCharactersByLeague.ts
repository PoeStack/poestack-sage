import { EchoContext } from 'echo-common'

type PoeCharacter = NonNullable<ReturnType<EchoContext['poeCharacters']['useCharacter']>['value']>

export function groupCharactersByLeague(characters: PoeCharacter[]) {
  return characters?.reduce(
    (groups, character) => {
      const league = character.league
      if (!league) {
        return groups
      }
      if (groups[league]) {
        groups[league].push(character)
      } else {
        groups[league] = [character]
      }
      return groups
    },
    {} as Record<string, PoeCharacter[]>
  )
}
