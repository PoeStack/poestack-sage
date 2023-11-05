export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
}

export type PoeApiCharacter = {
  __typename?: 'PoeApiCharacter'
  class?: Maybe<Scalars['String']>
  current?: Maybe<Scalars['Boolean']>
  deleted?: Maybe<Scalars['Boolean']>
  equipment?: Maybe<Array<Maybe<PoeApiItem>>>
  experience?: Maybe<Scalars['Float']>
  expired?: Maybe<Scalars['Boolean']>
  id?: Maybe<Scalars['String']>
  inventory?: Maybe<Array<Maybe<PoeApiItem>>>
  jewels?: Maybe<Array<Maybe<PoeApiItem>>>
  league?: Maybe<Scalars['String']>
  level?: Maybe<Scalars['Float']>
  name?: Maybe<Scalars['String']>
  passives?: Maybe<PoeApiCharacterPassive>
}

export type PoeApiCharacterPassive = {
  __typename?: 'PoeApiCharacterPassive'
  bandit_choice?: Maybe<Scalars['String']>
  hashes?: Maybe<Array<Maybe<Scalars['Float']>>>
  hashes_ex?: Maybe<Array<Maybe<Scalars['Float']>>>
  pantheon_major?: Maybe<Scalars['String']>
  pantheon_minor?: Maybe<Scalars['String']>
}

export type PoeApiFlavourTextInfo = {
  __typename?: 'PoeApiFlavourTextInfo'
  class?: Maybe<Scalars['String']>
  id?: Maybe<Scalars['String']>
  type?: Maybe<Scalars['String']>
}

export type PoeApiInflunce = {
  __typename?: 'PoeApiInflunce'
  name?: Maybe<Scalars['String']>
}

export type PoeApiItem = {
  __typename?: 'PoeApiItem'
  abyssJewel?: Maybe<Scalars['Boolean']>
  additionalProperties?: Maybe<Array<Maybe<PoeApiItemProperty>>>
  artFilename?: Maybe<Scalars['String']>
  baseType?: Maybe<Scalars['String']>
  cisRaceReward?: Maybe<Scalars['Boolean']>
  colour?: Maybe<Scalars['String']>
  corrupted?: Maybe<Scalars['Boolean']>
  cosmeticMods?: Maybe<Array<Maybe<Scalars['String']>>>
  craftedMods?: Maybe<Array<Maybe<Scalars['String']>>>
  crucible?: Maybe<PoeApiItemCrucibleMods>
  delve?: Maybe<Scalars['Boolean']>
  descrText?: Maybe<Scalars['String']>
  duplicated?: Maybe<Scalars['Boolean']>
  elder?: Maybe<Scalars['Boolean']>
  enchantMods?: Maybe<Array<Maybe<Scalars['String']>>>
  explicitMods?: Maybe<Array<Maybe<Scalars['String']>>>
  extended?: Maybe<PoeApiItemExtended>
  flavourText?: Maybe<Array<Maybe<Scalars['String']>>>
  flavourTextParsed?: Maybe<Array<Maybe<PoeApiFlavourTextInfo>>>
  foilVariation?: Maybe<Scalars['Int']>
  forum_note?: Maybe<Scalars['String']>
  fractured?: Maybe<Scalars['Boolean']>
  fracturedMods?: Maybe<Array<Maybe<Scalars['String']>>>
  frameType?: Maybe<Scalars['Float']>
  h?: Maybe<Scalars['Int']>
  hybrid?: Maybe<PoeApiItemHybrid>
  icon?: Maybe<Scalars['String']>
  id?: Maybe<Scalars['String']>
  identified?: Maybe<Scalars['Boolean']>
  implicitMods?: Maybe<Array<Maybe<Scalars['String']>>>
  incubatedItem?: Maybe<PoeApiItemIncubatedItem>
  influences?: Maybe<PoeApiInflunce>
  inventoryId?: Maybe<Scalars['String']>
  isRelic?: Maybe<Scalars['Boolean']>
  itemLevel?: Maybe<Scalars['Int']>
  league?: Maybe<Scalars['String']>
  lockedToAccount?: Maybe<Scalars['Boolean']>
  lockedToCharacter?: Maybe<Scalars['Boolean']>
  logbookMods?: Maybe<Array<Maybe<PoeApiItemLogbookMod>>>
  maxStackSize?: Maybe<Scalars['Int']>
  name?: Maybe<Scalars['String']>
  nextLevelRequirements?: Maybe<Array<Maybe<PoeApiItemProperty>>>
  notableProperties?: Maybe<Array<Maybe<PoeApiItemProperty>>>
  note?: Maybe<Scalars['String']>
  properties?: Maybe<Array<Maybe<PoeApiItemProperty>>>
  prophecyText?: Maybe<Scalars['String']>
  replica?: Maybe<Scalars['Boolean']>
  requirements?: Maybe<Array<Maybe<PoeApiItemProperty>>>
  ruthless?: Maybe<Scalars['Boolean']>
  scourgeMods?: Maybe<Array<Maybe<Scalars['String']>>>
  scourged?: Maybe<PoeApiItemScourged>
  seaRaceReward?: Maybe<Scalars['Boolean']>
  searing?: Maybe<Scalars['Boolean']>
  secDescrText?: Maybe<Scalars['String']>
  shaper?: Maybe<Scalars['Boolean']>
  socket?: Maybe<Scalars['Int']>
  socketedItems?: Maybe<Array<Maybe<PoeApiItem>>>
  sockets?: Maybe<Array<Maybe<PoeApiItemSocket>>>
  split?: Maybe<Scalars['Boolean']>
  stackSize?: Maybe<Scalars['Int']>
  stackSizeText?: Maybe<Scalars['String']>
  support?: Maybe<Scalars['Boolean']>
  synthesised?: Maybe<Scalars['Boolean']>
  talismanTier?: Maybe<Scalars['Int']>
  tangled?: Maybe<Scalars['Boolean']>
  thRaceReward?: Maybe<Scalars['Boolean']>
  typeLine?: Maybe<Scalars['String']>
  ultimatumMods?: Maybe<Array<Maybe<PoeApiItemUltimatumMods>>>
  unmodifiable?: Maybe<Scalars['Boolean']>
  utilityMods?: Maybe<Array<Maybe<Scalars['String']>>>
  veiled?: Maybe<Scalars['Boolean']>
  veiledMods?: Maybe<Array<Maybe<Scalars['String']>>>
  verified?: Maybe<Scalars['Boolean']>
  w?: Maybe<Scalars['Int']>
  x?: Maybe<Scalars['Int']>
  y?: Maybe<Scalars['Int']>
}

export type PoeApiItemCrucibleMods = {
  __typename?: 'PoeApiItemCrucibleMods'
  layout?: Maybe<Scalars['String']>
}

export type PoeApiItemCrucibleNode = {
  __typename?: 'PoeApiItemCrucibleNode'
  allocated?: Maybe<Scalars['Boolean']>
  icon?: Maybe<Scalars['String']>
  in?: Maybe<Array<Maybe<Scalars['String']>>>
  orbit?: Maybe<Scalars['Int']>
  orbitIndex?: Maybe<Scalars['Int']>
  out?: Maybe<Array<Maybe<Scalars['String']>>>
  skill?: Maybe<Scalars['String']>
  stats?: Maybe<Array<Maybe<Scalars['String']>>>
}

export type PoeApiItemExtended = {
  __typename?: 'PoeApiItemExtended'
  category?: Maybe<Scalars['String']>
  prefixes?: Maybe<Scalars['Float']>
  subcategories?: Maybe<Array<Maybe<Scalars['String']>>>
  suffixes?: Maybe<Scalars['Float']>
}

export type PoeApiItemHybrid = {
  __typename?: 'PoeApiItemHybrid'
  baseTypeName?: Maybe<Scalars['String']>
  explicitMods?: Maybe<Array<Maybe<Scalars['String']>>>
  isVaalGem?: Maybe<Scalars['Boolean']>
  properties?: Maybe<Array<Maybe<PoeApiItemProperty>>>
  secDescrText?: Maybe<Scalars['String']>
}

export type PoeApiItemIncubatedItem = {
  __typename?: 'PoeApiItemIncubatedItem'
  level?: Maybe<Scalars['Int']>
  name?: Maybe<Scalars['String']>
  progress?: Maybe<Scalars['Float']>
  total?: Maybe<Scalars['Float']>
}

export type PoeApiItemLogbookFaction = {
  __typename?: 'PoeApiItemLogbookFaction'
  id?: Maybe<Scalars['String']>
  name?: Maybe<Scalars['String']>
}

export type PoeApiItemLogbookMod = {
  __typename?: 'PoeApiItemLogbookMod'
  faction?: Maybe<PoeApiItemLogbookFaction>
  mod?: Maybe<Array<Maybe<Scalars['String']>>>
  name?: Maybe<Scalars['String']>
}

export type PoeApiItemProperty = {
  __typename?: 'PoeApiItemProperty'
  displayMode?: Maybe<Scalars['Float']>
  name?: Maybe<Scalars['String']>
  progress?: Maybe<Scalars['Float']>
  suffix?: Maybe<Scalars['String']>
  type?: Maybe<Scalars['Float']>
  values?: Maybe<Array<Maybe<Array<Maybe<Scalars['String']>>>>>
}

export type PoeApiItemScourged = {
  __typename?: 'PoeApiItemScourged'
  level?: Maybe<Scalars['Float']>
  progress?: Maybe<Scalars['Float']>
  tier?: Maybe<Scalars['Float']>
  total?: Maybe<Scalars['Float']>
}

export type PoeApiItemSocket = {
  __typename?: 'PoeApiItemSocket'
  attr?: Maybe<Scalars['String']>
  group?: Maybe<Scalars['Int']>
  sColour?: Maybe<Scalars['String']>
}

export type PoeApiItemUltimatumMods = {
  __typename?: 'PoeApiItemUltimatumMods'
  tier?: Maybe<Scalars['Int']>
  type?: Maybe<Scalars['String']>
}

export type PoeApiProfile = {
  __typename?: 'PoeApiProfile'
  guild?: Maybe<PoeApiProfileGuild>
  name?: Maybe<Scalars['String']>
  realm?: Maybe<Scalars['String']>
  twitch?: Maybe<PoeApiProfileTwitch>
  uuid?: Maybe<Scalars['String']>
}

export type PoeApiProfileGuild = {
  __typename?: 'PoeApiProfileGuild'
  name?: Maybe<Scalars['String']>
}

export type PoeApiProfileTwitch = {
  __typename?: 'PoeApiProfileTwitch'
  name?: Maybe<Scalars['String']>
}

export type PoeApiPublicStashChange = {
  __typename?: 'PoeApiPublicStashChange'
  accountName?: Maybe<Scalars['String']>
  id?: Maybe<Scalars['String']>
  items?: Maybe<Array<Maybe<PoeApiItem>>>
  league?: Maybe<Scalars['String']>
  public?: Maybe<Scalars['Boolean']>
  stash?: Maybe<Scalars['String']>
  stashType?: Maybe<Scalars['String']>
}

export type PoeApiPublicStashResponse = {
  __typename?: 'PoeApiPublicStashResponse'
  next_change_id?: Maybe<Scalars['String']>
  stashes?: Maybe<Array<Maybe<PoeApiPublicStashChange>>>
}

export type PoeApiStashTab = {
  __typename?: 'PoeApiStashTab'
  children?: Maybe<Array<Maybe<PoeApiStashTab>>>
  id?: Maybe<Scalars['String']>
  index?: Maybe<Scalars['Float']>
  items?: Maybe<Array<Maybe<PoeApiItem>>>
  metadata?: Maybe<PoeApiStashTabMetadata>
  name?: Maybe<Scalars['String']>
  parent?: Maybe<Scalars['String']>
  type?: Maybe<Scalars['String']>
}

export type PoeApiStashTabMetadata = {
  __typename?: 'PoeApiStashTabMetadata'
  colour?: Maybe<Scalars['String']>
  folder?: Maybe<Scalars['Boolean']>
  public?: Maybe<Scalars['Boolean']>
}

export type PoeApiTokenExchangeResponse = {
  __typename?: 'PoeApiTokenExchangeResponse'
  access_token?: Maybe<Scalars['String']>
  expires_in?: Maybe<Scalars['String']>
  refresh_token?: Maybe<Scalars['String']>
  scope?: Maybe<Scalars['String']>
  token_type?: Maybe<Scalars['String']>
}
