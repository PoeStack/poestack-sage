export type PoeCharacter = {
    class?: string;
    current?: boolean;
    deleted?: boolean;
    equipment?: PoeItem[];
    experience?: number;
    expired?: boolean;
    id?: string;
    inventory?: PoeItem[];
    jewels?: PoeItem[];
    league?: string;
    level?: number;
    name?: string;
    passives?: PoeCharacterPassive[];
};

export type PoeCharacterPassive = {
    bandit_choice?: string;
    hashes?: number[];
    hashes_ex?: number[];
    pantheon_major?: string;
    pantheon_minor?: string;
};

export type PoeFlavourTextInfo = {
    class?: string;
    id?: string;
    type?: string;
};

export type PoeInfluence = {
    name?: string;
};

export type PoeItem = {
    abyssJewel?: boolean;
    additionalProperties?: PoeItemProperty[];
    artFilename?: string;
    baseType?: string;
    cisRaceReward?: boolean;
    colour?: string;
    corrupted?: boolean;
    cosmeticMods?: string[];
    craftedMods?: string[];
    crucible?: PoeItemCrucibleMods[];
    delve?: boolean;
    descrText?: string;
    duplicated?: boolean;
    elder?: boolean;
    enchantMods?: string[];
    explicitMods?: string[];
    extended?: PoeItemExtended;
    flavourText?: string[];
    flavourTextParsed?: PoeFlavourTextInfo[];
    foilVariation?: number;
    forum_note?: string;
    fractured?: boolean;
    fracturedMods?: string[];
    frameType?: number;
    h?: number;
    hybrid?: PoeItemHybrid;
    icon?: string;
    id?: string;
    identified?: boolean;
    implicitMods?: string[];
    incubatedItem?: PoeItemIncubatedItem;
    influences?: PoeInfluence;
    inventoryId?: string;
    isRelic?: boolean;
    itemLevel?: number;
    league?: string;
    lockedToAccount?: boolean;
    lockedToCharacter?: boolean;
    logbookMods?: PoeItemLogbookMod[];
    maxStackSize?: number;
    name?: string;
    nextLevelRequirements?: PoeItemProperty[];
    notableProperties?: PoeItemProperty[];
    note?: string;
    properties?: PoeItemProperty[];
    prophecyText?: string;
    replica?: boolean;
    requirements?: PoeItemProperty[];
    ruthless?: boolean;
    scourgeMods?: string[];
    scourged?: PoeItemScourged;
    seaRaceReward?: boolean;
    searing?: boolean;
    secDescrText?: string;
    shaper?: boolean;
    socket?: number;
    socketedItems?: PoeItem[];
    sockets?: PoeItemSocket[];
    split?: boolean;
    stackSize?: number;
    stackSizeText?: string;
    support?: boolean;
    synthesised?: boolean;
    talismanTier?: number;
    tangled?: boolean;
    thRaceReward?: boolean;
    typeLine?: string;
    ultimatumMods?: PoeItemUltimatumMods[];
    unmodifiable?: boolean;
    utilityMods?: string[];
    veiled?: boolean;
    veiledMods?: string[];
    verified?: boolean;
    w?: number;
    x?: number;
    y?: number;
};

export type PoeItemCrucibleMods = {
    layout?: string;
};

export type PoeItemCrucibleNode = {
    allocated?: boolean;
    icon?: string;
    in?: string[];
    orbit?: number;
    orbitIndex?: number;
    out?: string[];
    skill?: string;
    stats?: string[];
};

export type PoeItemExtended = {
    category?: string;
    prefixes?: number;
    subcategories?: string[];
    suffixes?: number;
};

export type PoeLeagueAccount = {

}

export type PoeItemHybrid = {
    baseTypeName?: string;
    explicitMods?: string[];
    isVaalGem?: boolean;
    properties?: PoeItemProperty[];
    secDescrText?: string;
};

export type PoeItemIncubatedItem = {
    level?: number;
    name?: string;
    progress?: number;
    total?: number;
};

export type PoeItemLogbookFaction = {
    id?: string;
    name?: string;
};

export type PoeItemLogbookMod = {
    faction?: PoeItemLogbookFaction;
    mod?: string[];
    name?: string;
};

export type PoeItemProperty = {
    displayMode?: number;
    name?: string;
    progress?: number;
    suffix?: string;
    type?: number;
    values?: string[][];
};

export type PoeItemScourged = {
    level?: number;
    progress?: number;
    tier?: number;
    total?: number;
};

export type PoeItemSocket = {
    attr?: string;
    group?: number;
    sColour?: string;
};

export type PoeItemUltimatumMods = {
    tier?: number;
    type?: string;
};

export type PoeProfile = {
    guild?: PoeProfileGuild;
    name?: string;
    realm?: string;
    twitch?: PoeProfileTwitch;
    uuid?: string;
};

export type PoeProfileGuild = {
    name?: string;
};

export type PoeProfileTwitch = {
    name?: string;
};

export type PoePublicStashChange = {
    accountName?: string;
    id?: string;
    items?: PoeItem[];
    league?: string;
    public?: boolean;
    stash?: string;
    stashType?: string;
};

export type PoePublicStashResponse = {
    next_change_id?: string;
    stashes?: PoePublicStashChange[];
};

export type PoePartialStashTab = {
    children?: PoePartialStashTab[];
    id?: string;
    index?: number;
    metadata?: PoeStashTabMetadata;
    name?: string;
    parent?: string;
    type?: string;

    //Injected
    league: string;
};

export type PoeLeague = {
    id: string,
    realm?: string,
    description?: string,
    rules?: PoeLeagueRule[],
    registerAt?: string,
    event?: boolean,
    url?: string,
    startAt?: string,
    endAt?: string,
    timedEvent?: boolean,
    scoreEvent?: boolean,
    delveEvent?: boolean,
    ancestorEvent?: boolean,
    leagueEvent?: boolean
}

export type PoeLeagueRule = {
    id: string,
    name: string,
    description?: string
}

export type PoeStashTab = PoePartialStashTab & {
    items?: PoeItem[];
    loadedAtTimestamp: string;
};

export type PoeStashTabMetadata = {
    colour?: string;
    folder?: boolean;
    public?: boolean;
};

export type PoeTokenExchangeResponse = {
    access_token?: string;
    expires_in?: string;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
};
