import { action, computed, makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { Character } from './character'
import { ICharacter } from '../../interfaces/character.interface'
import { IStashTab } from '../../interfaces/stash.interface'
import { IAccountLeague } from '../../interfaces/account-league.interface'
import { v4 as uuidv4 } from 'uuid'

export class AccountLeague implements IAccountLeague {
  @persist uuid: string = uuidv4()
  @persist leagueId: string = ''
  @persist('list', Character) @observable characters: Character[] = []
  @persist('list') @observable stashtabs: IStashTab[] = []

  constructor(id: string) {
    makeObservable(this)
    this.leagueId = id
  }

  @computed
  get stashTabList() {
    const flattenedTabs = this.stashtabs.flatMap((st) => {
      return st.children ?? st
    })
    return flattenedTabs
  }

  @action
  updateCharacters(characters: ICharacter[]) {
    const newCharacters = characters.filter(
      (c) => this.characters.find((ec) => ec.name === c.name) === undefined
    )
    this.characters = this.characters.concat(
      newCharacters.map((c) => {
        return new Character(c)
      })
    )
  }

  @action
  getStashTabs() {}

  @action
  getStashTabsSuccess() {}

  @action
  getStashTabsFail() {}
}
