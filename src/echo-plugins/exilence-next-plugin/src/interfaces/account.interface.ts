export interface IAccount {
  uuid?: string
  name: string
}

export interface IAccountEntity extends IAccount {
  accountLeagueIds: string[]
  profileIds: string[]
}
