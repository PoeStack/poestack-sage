import {CachedTask} from "./cached-task";
import {GGG_API} from "./echo-context";
import {bind} from "@react-rxjs/core";
import {map} from "rxjs";
import {PoeCharacter} from "sage-common";

export class PoeCharactersService {

    public characterList = new CachedTask<PoeCharacter[]>((key) => GGG_API.getCharacters())
    public characters = new CachedTask<PoeCharacter>((key) => GGG_API.getCharacter(key))
}

export const POE_CHARACTER_SERVICE = new PoeCharactersService()

export const [usePoeCharacterList] = bind(
    POE_CHARACTER_SERVICE.characterList.cache$.pipe(
        map((e) => Object.values(e)?.[0]?.result)
    ), [])

export const [usePoeCharacter] = bind((name: string) => POE_CHARACTER_SERVICE.characters.cache$.pipe(
    map((e) => e[name]?.result)
), null)