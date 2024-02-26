export type UserInfo = {
  // JWT Decode
  oAuthToken?: string
  profile?: EncodedProfile
  iat: number
}

export type EncodedProfile = {
  uuid: string
  name: string
  realm: string // pc
  locale: null | string
  guild?: {
    name: string
  }
  twitch?: {
    name: string
  }
}
