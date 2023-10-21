export type PoeApiCharacter = {
    class?: string;
    current?: boolean;
    deleted?: boolean;
    equipment?: PoeApiItem[];
    experience?: number;
    expired?: boolean;
    id?: string;
    inventory?: PoeApiItem[];
    jewels?: PoeApiItem[];
    league?: string;
    level?: number;
    name?: string;
    passives?: PoeApiCharacterPassive[];
};

export type PoeApiCharacterPassive = {
    bandit_choice?: string;
    hashes?: number[];
    hashes_ex?: number[];
    pantheon_major?: string;
    pantheon_minor?: string;
};

export type PoeApiFlavourTextInfo = {
    class?: string;
    id?: string;
    type?: string;
};

export type PoeApiInfluence = {
    name?: string;
};

export type PoeApiItem = {
    abyssJewel?: boolean;
    additionalProperties?: PoeApiItemProperty[];
    artFilename?: string;
    baseType?: string;
    cisRaceReward?: boolean;
    colour?: string;
    corrupted?: boolean;
    cosmeticMods?: string[];
    craftedMods?: string[];
    crucible?: PoeApiItemCrucibleMods[];
    delve?: boolean;
    descrText?: string;
    duplicated?: boolean;
    elder?: boolean;
    enchantMods?: string[];
    explicitMods?: string[];
    extended?: PoeApiItemExtended;
    flavourText?: string[];
    flavourTextParsed?: PoeApiFlavourTextInfo[];
    foilVariation?: number;
    forum_note?: string;
    fractured?: boolean;
    fracturedMods?: string[];
    frameType?: number;
    h?: number;
    hybrid?: PoeApiItemHybrid;
    icon?: string;
    id?: string;
    identified?: boolean;
    implicitMods?: string[];
    incubatedItem?: PoeApiItemIncubatedItem;
    influences?: PoeApiInfluence;
    inventoryId?: string;
    isRelic?: boolean;
    itemLevel?: number;
    league?: string;
    lockedToAccount?: boolean;
    lockedToCharacter?: boolean;
    logbookMods?: PoeApiItemLogbookMod[];
    maxStackSize?: number;
    name?: string;
    nextLevelRequirements?: PoeApiItemProperty[];
    notableProperties?: PoeApiItemProperty[];
    note?: string;
    properties?: PoeApiItemProperty[];
    prophecyText?: string;
    replica?: boolean;
    requirements?: PoeApiItemProperty[];
    ruthless?: boolean;
    scourgeMods?: string[];
    scourged?: PoeApiItemScourged;
    seaRaceReward?: boolean;
    searing?: boolean;
    secDescrText?: string;
    shaper?: boolean;
    socket?: number;
    socketedItems?: PoeApiItem[];
    sockets?: PoeApiItemSocket[];
    split?: boolean;
    stackSize?: number;
    stackSizeText?: string;
    support?: boolean;
    synthesised?: boolean;
    talismanTier?: number;
    tangled?: boolean;
    thRaceReward?: boolean;
    typeLine?: string;
    ultimatumMods?: PoeApiItemUltimatumMods[];
    unmodifiable?: boolean;
    utilityMods?: string[];
    veiled?: boolean;
    veiledMods?: string[];
    verified?: boolean;
    w?: number;
    x?: number;
    y?: number;
};

export type PoeApiItemCrucibleMods = {
    layout?: string;
};

export type PoeApiItemCrucibleNode = {
    allocated?: boolean;
    icon?: string;
    in?: string[];
    orbit?: number;
    orbitIndex?: number;
    out?: string[];
    skill?: string;
    stats?: string[];
};

export type PoeApiItemExtended = {
    category?: string;
    prefixes?: number;
    subcategories?: string[];
    suffixes?: number;
};

export type PoeApiItemHybrid = {
    baseTypeName?: string;
    explicitMods?: string[];
    isVaalGem?: boolean;
    properties?: PoeApiItemProperty[];
    secDescrText?: string;
};

export type PoeApiItemIncubatedItem = {
    level?: number;
    name?: string;
    progress?: number;
    total?: number;
};

export type PoeApiItemLogbookFaction = {
    id?: string;
    name?: string;
};

export type PoeApiItemLogbookMod = {
    faction?: PoeApiItemLogbookFaction;
    mod?: string[];
    name?: string;
};

export type PoeApiItemProperty = {
    displayMode?: number;
    name?: string;
    progress?: number;
    suffix?: string;
    type?: number;
    values?: string[][];
};

export type PoeApiItemScourged = {
    level?: number;
    progress?: number;
    tier?: number;
    total?: number;
};

export type PoeApiItemSocket = {
    attr?: string;
    group?: number;
    sColour?: string;
};

export type PoeApiItemUltimatumMods = {
    tier?: number;
    type?: string;
};

export type PoeApiProfile = {
    guild?: PoeApiProfileGuild;
    name?: string;
    realm?: string;
    twitch?: PoeApiProfileTwitch;
    uuid?: string;
};

export type PoeApiProfileGuild = {
    name?: string;
};

export type PoeApiProfileTwitch = {
    name?: string;
};

export type PoeApiPublicStashChange = {
    accountName?: string;
    id?: string;
    items?: PoeApiItem[];
    league?: string;
    public?: boolean;
    stash?: string;
    stashType?: string;
};

export type PoeApiPublicStashResponse = {
    next_change_id?: string;
    stashes?: PoeApiPublicStashChange[];
};

export type PoeApiStashTab = {
    children?: PoeApiStashTab[];
    id?: string;
    index?: number;
    items?: PoeApiItem[];
    metadata?: PoeApiStashTabMetadata;
    name?: string;
    parent?: string;
    type?: string;
};

export type PoeApiStashTabMetadata = {
    colour?: string;
    folder?: boolean;
    public?: boolean;
};

export type PoeApiTokenExchangeResponse = {
    access_token?: string;
    expires_in?: string;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
};
