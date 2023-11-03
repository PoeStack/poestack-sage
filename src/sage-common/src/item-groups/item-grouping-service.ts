import fs from "fs";
import {PoeItem} from "../ggg/poe-api-models";
import {ItemUtils} from "./item-utils";
import objectHash from "object-hash";

class ItemGroupingService {
    private readonly pricingHandlers: ItemGroupIdentifier[] = [];

    constructor() {
        this.pricingHandlers.push(
            new WatchersEyeGroupIdentifier(),
            new TimelessJewelGroupIdentifier(),
            new TattooGroupIdentifier(),
            new BloodFilledVesselGroupIdentifier(),
            new UnqiueGearGroupIdentifier(),
            new TomeGroupIdentifier(),
            new BeastGroupIdentifier(),
            new MemoryGroupIdentifier(),
            new HeistBlueprintsGroupIdentifier(),
            new GemGroupIdentifier(),
            new HeistContractsGroupIdentifier(),
            new LogbookGroupIdentifier(),
            new ClusterGroupIdentifier(),
            new MapGroupIdentifier(),
            new CompassGroupIdentifier(),
            new IncubatorGroupIdentifier(),
            new CurrencyGroupIdentifier()
        );
    }

    public group(
        item: PoeItem): { key: string, tag: string, hash: string } | null {
        if (item.lockedToAccount || item.lockedToCharacter) {
            return null;
        }

        for (const groupIdentifier of this.pricingHandlers) {
            const internalGroup: InternalGroup | null = groupIdentifier.group(item);
            if (internalGroup) {
                const hash = objectHash(
                    {
                        tag: internalGroup.tag,
                        key: internalGroup.key,
                        propertiesHash: internalGroup.hashProperties,
                    },
                    {unorderedArrays: true, unorderedObjects: true}
                );
                return {key: internalGroup.key, tag: internalGroup.tag, hash: hash}
            }
        }

        return null;
    }
}

interface InternalGroup {
    key: string;
    tag: string;
    hashProperties: Record<string, number | string | boolean | string[] | null | undefined>;
    displayOverride?: string;
}

export interface ItemGroupIdentifier {
    group: (item: PoeItem) => InternalGroup | null;
}

export class TimelessJewelGroupIdentifier implements ItemGroupIdentifier {
    group(item: PoeItem): InternalGroup | null {
        if (
            item.typeLine?.toLowerCase().includes("timeless jewel") &&
            item.identified
        ) {
            const group: InternalGroup = {
                key: item.name!!.toLowerCase(),
                tag: "timeless jewel",
                hashProperties: {
                    mods: item.explicitMods!!,
                },
            };
            return group;
        }
        return null;
    }
}

export class WatchersEyeGroupIdentifier implements ItemGroupIdentifier {
    group(item: PoeItem): InternalGroup | null {
        if (
            (item.frameType === 3 || item.frameType === 10) &&
            item.baseType?.toLowerCase() === "prismatic jewel" &&
            item.icon?.toLowerCase()?.includes("elderjewel.png") &&
            !item.identified
        ) {
            const ilvl = item.ilvl ?? item.itemLevel;
            const group: InternalGroup = {
                key: "unidentified watcher's eye",
                tag: "unique",
                hashProperties: {
                    ilvl: ilvl!!,
                },
            };
            return group;
        }
        return null;
    }
}

export class TomeGroupIdentifier implements ItemGroupIdentifier {
    group(item: PoeItem): InternalGroup | null {
        if (item.baseType?.toLowerCase() === "forbidden tome" && item.identified) {
            const ilvl = item.ilvl ?? item.itemLevel;
            const group: InternalGroup = {
                key: "forbidden tome",
                tag: "forbidden tome",
                hashProperties: {
                    ilvl: ilvl!!,
                },
            };
            return group;
        }
        return null;
    }
}

export class TattooGroupIdentifier implements ItemGroupIdentifier {
    group(item: PoeItem): InternalGroup | null {
        if (item.baseType?.toLowerCase().startsWith("tattoo of the")) {
            const group: InternalGroup = {
                key: item.baseType?.toLowerCase().replace("tattoo of the", ""),
                tag: "tattoo",
                hashProperties: {},
            };
            return group;
        }
        return null;
    }
}

export class BloodFilledVesselGroupIdentifier implements ItemGroupIdentifier {
    group(item: PoeItem): InternalGroup | null {
        if (item.baseType?.toLowerCase() === "blood-filled vessel") {
            const monsterLvl = item.properties?.find(
                (p) => p.name === "Monster Level"
            )?.values?.[0]?.[0];

            if (monsterLvl) {
                const group: InternalGroup = {
                    key: "blood-filled vessel",
                    tag: "fragment",
                    hashProperties: {
                        monsterLvl: parseInt(monsterLvl),
                    },
                };
                return group;
            }
        }
        return null;
    }
}

export class HelmEnchantGroupIdentifier implements ItemGroupIdentifier {
    group(item: PoeItem): InternalGroup | null {
        const enchant = item.enchantMods?.join(" ");
        if (enchant && [0, 1, 2].includes(item.frameType!!)) {
            const itemCategory = ItemUtils.decodeIcon(item.icon!!, 0);

            if (itemCategory?.includes("helmet")) {
                const ilvl = item.ilvl ?? item.itemLevel;
                const cleanCategory = itemCategory
                    .replaceAll("helmet", "")
                    .replaceAll(/[0-9]/g, "");

                const group: InternalGroup = {
                    key: enchant,
                    tag: "enchant",
                    hashProperties: {
                        type: cleanCategory,
                        ilvl: ilvl!! >= 84 ? "84+" : "<84",
                    },
                };
                return group;
            }
        }
        return null;
    }
}

export class UnqiueGearGroupIdentifier implements ItemGroupIdentifier {
    group(item: PoeItem): InternalGroup | null {
        const key = item.name?.toLowerCase();
        if ((item.frameType === 3 || item.frameType === 10) && key?.length) {
            const baseGroup: InternalGroup = {
                key: item.name!!.toLowerCase(),
                tag: "unique",
                hashProperties: {
                    sixLink: false,
                    corruptedMods: null,
                    enchantMods: null,
                },
            };
            const itemCategory = ItemUtils.decodeIcon(item.icon!!, 0);

            let res = baseGroup;
            if (item.sockets?.filter((s) => s.group === 0).length === 6) {
                res = {
                    ...res,
                    hashProperties: {...res.hashProperties, sixLink: true},
                };
            }

            if (!!item.corrupted) {
                const corruptedMods =
                    item.implicitMods?.map((e) => e.replaceAll(/[0-9]+/g, "#")) ?? [];
                corruptedMods.sort();
                res = {
                    ...res,
                    hashProperties: {
                        ...res.hashProperties,
                        corruptedMods: corruptedMods.map((e) => e.toLowerCase()),
                    },
                };
            } else if (itemCategory?.includes("helmet")) {
                const mappedEnchantMods = (item.enchantMods ?? []).map((e) =>
                    e.toLowerCase()
                );
                mappedEnchantMods.sort();
                if (mappedEnchantMods.length) {
                    res = {
                        ...res,
                        hashProperties: {
                            ...res.hashProperties,
                            enchantMods: mappedEnchantMods,
                        },
                    };
                }
            }

            return res;
        }
        return null;
    }
}

export class BeastGroupIdentifier implements ItemGroupIdentifier {
    group(item: PoeItem): InternalGroup | null {
        if (item?.descrText === "Right-click to add this to your bestiary.") {
            const baseType = item.baseType?.toLocaleLowerCase();
            return {
                key: baseType!!,
                tag: "beast",
                hashProperties: {},
            };
        }

        return null;
    }
}

export class MemoryGroupIdentifier implements ItemGroupIdentifier {
    group(item: PoeItem): InternalGroup | null {
        const typeLine = item.typeLine?.toLocaleLowerCase();
        if (
            typeLine &&
            item.descrText ===
            "Right-click on this, then left click on a completed Map on your Atlas to apply this Memory."
        ) {
            return {
                key: typeLine,
                tag: "atlas memory",
                hashProperties: {},
            };
        }

        return null;
    }
}

export class GemGroupIdentifier implements ItemGroupIdentifier {
    private readonly exceptionalGems: string[] = [
        "enlighten",
        "empower",
        "enhance",
        "enlighten support",
        "empower support",
        "enhance support",
    ];

    private convertLvlToRange(typeLine: string, lvl: number): string {
        if (
            this.exceptionalGems.includes(typeLine) ||
            this.exceptionalGems.includes(typeLine.replaceAll("awakened ", ""))
        ) {
            return lvl.toString();
        }
        if (lvl >= 20) {
            return lvl.toString();
        }
        return "1-19";
    }

    private convertQToRange(typeLine: string, quality: number): string {
        if (
            this.exceptionalGems.includes(typeLine) ||
            this.exceptionalGems.includes(typeLine.replaceAll("awakened ", ""))
        ) {
            return "any";
        }

        if (quality === 0) {
            return quality.toString();
        }
        if (quality >= 20) {
            return quality.toString();
        }
        return "1-19";
    }

    group(item: PoeItem): InternalGroup | null {
        if (
            item.descrText ===
            "Place into an item socket of the right colour to gain this skill. Right click to remove from a socket." ||
            item.descrText ===
            "This is a Support Gem. It does not grant a bonus to your character, but to skills in sockets connected to it. Place into an item socket connected to a socket containing the Active Skill Gem you wish to augment. Right click to remove from a socket."
        ) {
            const typeLine = item.typeLine!!.toLowerCase();
            const quality = this.convertQToRange(
                typeLine,
                parseInt(
                    item.properties
                        ?.filter((p) => p.name === "Quality")?.[0]
                        ?.values?.[0]?.[0]?.replace(/[^0-9]/g, "") ?? "0"
                )
            );
            const lvl = this.convertLvlToRange(
                typeLine,
                parseInt(
                    item.properties
                        ?.filter((p) => p.name === "Level")?.[0]
                        ?.values?.[0]?.[0]?.replace(/[^0-9]/g, "") ?? "1"
                )
            );

            return {
                key: typeLine,
                tag: "gem",
                hashProperties: {
                    lvl: lvl ?? "1",
                    corrupted: !!item.corrupted,
                    quality: quality ?? "0",
                },
            };
        }

        return null;
    }
}

export class HeistBlueprintsGroupIdentifier implements ItemGroupIdentifier {
    group(item: PoeItem): InternalGroup | null {
        if (item.frameType === 3 || item.frameType === 10) return null;

        const baseType = item.baseType?.toLowerCase();
        if (baseType?.includes("blueprint:")) {
            const wingsRevealed = item.properties?.filter(
                (p) => p.name === "Wings Revealed"
            )?.[0]?.values?.[0]?.[0];
            const target = item.properties
                ?.filter((p) => p.name === "Heist Target: {0}")?.[0]
                ?.values?.[0]?.[0]?.toLowerCase();
            const ilvl = item["ilvl"] ?? item.itemLevel;
            const totalWings = wingsRevealed?.split("/")?.[1];
            const fullyRevealed = wingsRevealed?.split("/")?.[0] === totalWings;
            if (totalWings && ilvl && target) {
                return {
                    key: target + " blueprint",
                    tag: "blueprint",
                    hashProperties: {
                        ilvl: ilvl >= 81 ? "81+" : "<81",
                        totalWings: parseInt(totalWings),
                        fullyRevealed,
                    },
                };
            }
        }

        return null;
    }
}

export class HeistContractsGroupIdentifier implements ItemGroupIdentifier {
    group(item: PoeItem): InternalGroup | null {
        if (item.frameType === 3 || item.frameType === 10) return null;

        const baseType = item.baseType?.toLowerCase();

        if (baseType?.includes("contract:") && !item.corrupted && !item.split) {
            const ilvl = item["ilvl"] ?? item.itemLevel;
            const type = item.properties
                ?.filter((p) => p.name === "Requires {1} (Level {0})")?.[0]
                ?.values?.[1]?.[0]?.toLowerCase();
            if (ilvl && type) {
                return {
                    key: type + " contract",
                    tag: "contract",
                    hashProperties: {
                        ilvl: ilvl >= 81 ? "83+" : "<83",
                    },
                };
            }
        }

        return null;
    }
}

export class LogbookGroupIdentifier implements ItemGroupIdentifier {
    group(item: PoeItem): InternalGroup | null {
        const baseType = item.baseType?.toLowerCase();

        if (baseType?.includes("logbook")) {
            const ilvl = item.ilvl ?? item.itemLevel;
            const factions = item.logbookMods?.map((m) =>
                m?.faction?.name?.toLowerCase()
            ) ?? [];

            let faction = null;
            if (factions.includes("knights of the sun")) {
                faction = "knights of the sun";
            } else if (factions.includes("black scythe mercenaries")) {
                faction = "black scythe mercenaries";
            } else if (factions.includes("order of the chalice")) {
                faction = "order of the chalice";
            } else if (factions.includes("druids of the broken circle")) {
                faction = "druids of the broken circle";
            }

            if (ilvl && faction) {
                return {
                    key: faction + " logbook",
                    tag: "logbook",
                    hashProperties: {
                        ilvl: ilvl >= 83 ? "83+" : "<83",
                        corrupted: !!item.corrupted,
                        split: !!item.split,
                    },
                };
            }
        }

        return null;
    }
}

export class CompassGroupIdentifier implements ItemGroupIdentifier {
    public static DISPLAY_OVERRIDES: Record<string, string> = {};

    constructor() {
        Object.entries(
            JSON.parse(fs.readFileSync("data/tft/tft-compas.json").toString())
        ).forEach((e) => {
            CompassGroupIdentifier.DISPLAY_OVERRIDES[
                e[0]?.toLowerCase().replace("sextant ", "")
                ] = e[1] as string;
        });
    }

    private usesToString(uses: number): string {
        if (uses === 4 || uses === 16) {
            return `${uses}`;
        }

        if (uses < 4) {
            return "<4";
        }

        if (uses > 4 && uses < 16) {
            return "5-15";
        }

        return `${uses}`;
    }

    group(item: PoeItem): InternalGroup | null {
        const baseType = item.baseType?.toLowerCase();

        if (baseType === "charged compass") {
            const usesMod = item.enchantMods!!.filter(
                (mod) =>
                    mod.includes(" uses remaining") || mod.includes(" use remaining")
            )?.[0]?.replace(" uses remaining", "");
            const otherMods = item.enchantMods!!.filter(
                (mod) =>
                    !mod.includes("uses remaining") && !mod.includes("use remaining")
            ).join(" ").toLowerCase();

            return {
                key: otherMods + " compass",
                tag: "compass",
                displayOverride: CompassGroupIdentifier.DISPLAY_OVERRIDES[otherMods],
                hashProperties: {
                    uses: this.usesToString(parseInt(usesMod)),
                },
            };
        }

        return null;
    }
}

export class ClusterGroupIdentifier implements ItemGroupIdentifier {
    group(item: PoeItem): InternalGroup | null {
        if (item.frameType === 3 || item.frameType === 10) return null;
        const baseType = item.baseType?.toLowerCase();
        if (baseType && baseType.includes("cluster")) {
            const numberPassiveSkills =
                item.enchantMods
                    ?.filter(
                        (x) => x.startsWith("Adds ") && x.endsWith(" Passive Skills")
                    )?.[0]
                    .split(" ")[1] ?? "-1";
            const clusterType = item.enchantMods
                ?.filter((x) => x.startsWith("Added Small Passive Skills grant: "))?.[0]
                .replace("Added Small Passive Skills grant: ", "")
                .toLowerCase();
            const ilvl = item["ilvl"] ?? item.itemLevel;
            if (clusterType && numberPassiveSkills && ilvl) {
                return {
                    key: `${clusterType} ${baseType}`,
                    tag: "cluster",
                    hashProperties: {
                        ilvl,
                        passives: parseInt(numberPassiveSkills),
                    },
                };
            }
        }

        return null;
    }
}

export class IncubatorGroupIdentifier implements ItemGroupIdentifier {
    incubatorBaseTypes = new Set([
        "ornate incubator",
        "diviner's incubator",
        "otherworldly incubator",
        "kalguuran incubator",
        "thaumaturge's incubator",
        "infused incubator",
        "foreboding incubator",
        "cartographer's incubator",
        "skittering incubator",
        "blighted incubator",
        "singular incubator",
        "primal incubator",
        "celestial jeweller's incubator",
        "fossilised incubator",
        "abyssal incubator",
        "mysterious incubator",
        "celestial armoursmith's incubator",
        "geomancer's incubator",
        "fragmented incubator",
        "celestial blacksmith's incubator",
        "maddening incubator",
        "morphing incubator",
        "enchanted incubator",
        "obscured incubator",
    ]);

    group(item: PoeItem): InternalGroup | null {
        const baseType = item.baseType?.toLowerCase();
        if (baseType && this.incubatorBaseTypes.has(baseType)) {
            const ilvl = item.ilvl ?? item.itemLevel;
            return {
                key: baseType,
                tag: "incubator",
                hashProperties: {
                    ilvl: ilvl!!,
                },
            };
        }
        return null;
    }
}

export class MapGroupIdentifier implements ItemGroupIdentifier {
    private readonly mapImplicits: { [key: string]: string } = {
        "Map contains Al-Hezmin's Citadel\nItem Quantity increases amount of Rewards Al-Hezmin drops by 20% of its value":
            "al-hezmin's map",
        "Map contains Veritania's Citadel\nItem Quantity increases amount of Rewards Veritania drops by 20% of its value":
            "veritania's map",
        "Map contains Baran's Citadel\nItem Quantity increases amount of Rewards Baran drops by 20% of its value":
            "baran's map",
        "Map contains Drox's Citadel\nItem Quantity increases amount of Rewards Drox drops by 20% of its value":
            "drox's map",
        "Map is occupied by The Purifier": "purifier's map",
        "Map is occupied by The Constrictor": "constrictor's map",
        "Map is occupied by The Enslaver": "enslaver's map",
        "Map is occupied by The Eradicator": "eradicator's map",
    };

    group(item: PoeItem): InternalGroup | null {
        const baseType = item.baseType?.toLowerCase();
        const mapTier = item.properties?.filter(
            (prop) => prop.name === "Map Tier"
        )?.[0]?.values?.[0]?.[0];

        if (mapTier) {
            const specialMapType = item.implicitMods
                ?.map((mod) => this.mapImplicits[mod])
                .filter((group) => !!group)
                .join(",");

            return {
                key: (specialMapType ?? baseType)!!,
                tag: "map",
                hashProperties: {
                    tier: mapTier,
                },
            };
        }

        return null;
    }
}

export class CurrencyGroupIdentifier implements ItemGroupIdentifier {
    private readonly currencyGroupIds = {
        currency: {
            items: new Set([
                "gold",
                "chaos orb",
                "rogue's marker",
                "mirror of kalandra",
                "mirror shard",
                "fracturing orb",
                "tempering orb",
                "orb of dominance",
                "secondary regrading lens",
                "maven's orb",
                "divine orb",
                "tailoring orb",
                "tainted divine teardrop",
                "hunter's exalted orb",
                "prime regrading lens",
                "elevated sextant",
                "sacred crystallised lifeforce",
                "fracturing shard",
                "tainted exalted orb",
                "awakener's orb",
                "orb of conflict",
                "crusader's exalted orb",
                "warlord's exalted orb",
                "redeemer's exalted orb",
                "eldritch chaos orb",
                "sacred orb",
                "blessing of chayula",
                "exceptional eldritch ember",
                "eldritch orb of annulment",
                "exceptional eldritch ichor",
                "tainted orb of fusing",
                "exalted orb",
                "tainted blessing",
                "eldritch exalted orb",
                "tainted mythic orb",
                "ritual vessel",
                "blessing of uul-netol",
                "blessing of tul",
                "veiled chaos orb",
                "blessing of xoph",
                "blessing of esh",
                "grand eldritch ember",
                "oil extractor",
                "orb of annulment",
                "tainted chaos orb",
                "surveyor's compass",
                "grand eldritch ichor",
                "ancient orb",
                "tainted chromatic orb",
                "awakened sextant",

                "stacked deck",
                "harbinger's orb",
                "gemcutter's prism",
                "orb of unmaking",
                "greater eldritch ember",
                "tainted jeweller's orb",
                "regal orb",
                "exalted shard",
                "greater eldritch ichor",
                "annulment shard",
                "tainted armourer's scrap",
                "orb of regret",
                "vaal orb",
                "blessed orb",
                "orb of scouring",
                "instilling orb",
                "cartographer's chisel",
                "enkindling orb",
                "orb of horizons",
                "glassblower's bauble",
                "lesser eldritch ember",
                "lesser eldritch ichor",
                "orb of fusing",
                "tainted blacksmith's whetstone",
                "chromatic orb",
                "orb of alchemy",
                "orb of alteration",
                "orb of augmentation",
                "orb of binding",
                "orb of chance",
                "engineer's orb",
                "jeweller's orb",
                "portal scroll",
                "vivid crystallised lifeforce",
                "blacksmith's whetstone",
                "armourer's scrap",
                "orb of transmutation",
                "wild crystallised lifeforce",
                "primal crystallised lifeforce",
                "scroll of wisdom",
            ]),
        },
        "scouting report": {
            items: new Set([
                "explorer's scouting report",
                "vaal scouting report",
                "singular scouting report",
                "influenced scouting report",
                "blighted scouting report",
                "otherworldly scouting report",
                "comprehensive scouting report",
                "delirious scouting report",
                "operative's scouting report",
            ]),
        },
        fossil: {
            items: new Set([
                "glyphic fossil",
                "faceted fossil",
                "fractured fossil",
                "corroded fossil",
                "hollow fossil",
                "shuddering fossil",
                "sanctified fossil",
                "perfect fossil",
                "bloodstained fossil",
                "aetheric fossil",
                "bound fossil",
                "prismatic fossil",
                "serrated fossil",
                "tangled fossil",
                "deft fossil",
                "gilded fossil",
                "jagged fossil",
                "aberrant fossil",
                "dense fossil",
                "pristine fossil",
                "lucent fossil",
                "fundamental fossil",
                "metallic fossil",
                "scorched fossil",
                "frigid fossil",
            ]),
        },
        resonator: {
            items: new Set([
                "prime chaotic resonator",
                "powerful chaotic resonator",
                "potent chaotic resonator",
                "primitive chaotic resonator",
            ]),
        },
        artifacts: {
            items: new Set([
                "astragali",
                "scrap metal",
                "burial medallion",
                "exotic coinage",
            ]),
        },
        misc: {
            items: new Set(["albino rhoa feather", "facetor's lens"]),
        },
        vial: {
            items: new Set([
                "vial of consequence",
                "vial of the ghost",
                "vial of dominance",
                "vial of sacrifice",
                "vial of transcendence",
                "vial of summoning",
                "vial of awakening",
                "vial of the ritual",
                "vial of fate",
            ]),
        },
        oil: {
            items: new Set([
                "golden oil",
                "tainted oil",
                "silver oil",
                "opalescent oil",
                "black oil",
                "crimson oil",
                "reflective oil",
                "violet oil",
                "azure oil",
                "indigo oil",
                "teal oil",
                "verdant oil",
                "amber oil",
                "sepia oil",
                "clear oil",
            ]),
        },
        card: {
            items: new Set([
                "the apothecary",
                "the price of devotion",
                "house of mirrors",
                "the insane cat",
                "unrequited love",
                "the doctor",
                "the demon",
                "the fiend",
                "love through ice",
                "the immortal",
                "the shieldbearer",
                "the soul",
                "the nurse",
                "the cheater",
                "choking guilt",
                "wealth and power",
                "the sephirot",
                "the sustenance",
                "seven years bad luck",
                "the dragon's heart",
                "divine beauty",
                "desecrated virtue",
                "beauty through death",
                "succor of the sinless",
                "the price of loyalty",
                "doryani's epiphany",
                "the samurai's eye",
                "brother's stash",
                "a fate worse than death",
                "the enlightened",
                "the endless darkness",
                "eternal bonds",
                "home",
                "gemcutter's mercy",
                "the garish power",
                "broken promises",
                "the patient",
                "the last one standing",
                "monochrome",
                "imperfect memories",
                "the artist",
                "darker half",
                "magnum opus",
                "the sacrifice",
                "the destination",
                "luminous trove",
                "winter's embrace",
                "the mind's eyes",
                "the world eater",
                "alluring bounty",
                "tranquillity",
                "gift of asenath",
                "the hook",
                "the greatest intentions",
                "the eldritch decay",
                "pride of the first ones",
                "akil's prophecy",
                "the strategist",
                "the gulf",
                "the astromancer",
                "the shortcut",
                "deadly joy",
                "the escape",
                "fateful meeting",
                "the scout",
                "the damned",
                "the aspirant",
                "the long con",
                "the polymath",
                "remembrance",
                "the rabbit's foot",
                "abandoned wealth",
                "altered perception",
                "something dark",
                "the eye of terror",
                "the eternal war",
                "justified ambition",
                "the leviathan",
                "the eye of the dragon",
                "judging voices",
                "the enforcer",
                "a modest request",
                "the progeny of lunaris",
                "anarchy's price",
                "chaotic disposition",
                "pride before the fall",
                "the offering",
                "the vast",
                "nook's crown",
                "azyran's reward",
                "the old man",
                "the chosen",
                "underground forest",
                "council of cats",
                "the white knight",
                "a familiar call",
                "the academic",
                "the bitter blossom",
                "draped in dreams",
                "a stone perfected",
                "chasing risk",
                "duality",
                "the one that got away",
                "further invention",
                "auspicious ambitions",
                "the wedding gift",
                "the fishmonger",
                "the heroic shot",
                "a mother's parting gift",
                "mawr blaidd",
                "the dark mage",
                "the hunger",
                "the jester",
                "the professor",
                "the primordial",
                "dark dreams",
                "the bargain",
                "void of the elements",
                "the tumbleweed",
                "the awakened",
                "unchained",
                "brotherhood in exile",
                "haunting shadows",
                "dying light",
                "the last supper",
                "the price of prescience",
                "the emptiness",
                "the forgotten treasure",
                "the catch",
                "bijoux",
                "the forward gaze",
                "the brawny battle mage",
                "the shepherd's sandals",
                "a dusty memory",
                "prejudice",
                "the return of the rat",
                "the thaumaturgist",
                "call to the first ones",
                "the golden era",
                "terrible secret of space",
                "sambodhi's wisdom",
                "merciless armament",
                "the brittle emperor",
                "the seeker",
                "the bones",
                "audacity",
                "the porcupine",
                "the wind",
                "rebirth",
                "the bear woman",
                "dementophobia",
                "blind venture",
                "bowyer's dream",
                "dialla's subjugation",
                "dying anguish",
                "hunter's reward",
                "last hope",
                "lost worlds",
                "lucky deck",
                "the avenger",
                "the battle born",
                "the cartographer",
                "the celestial justicar",
                "the conduit",
                "the drunken aristocrat",
                "the ethereal",
                "the formless sea",
                "the fox",
                "the gentleman",
                "the king's heart",
                "the mercenary",
                "the oath",
                "the pack leader",
                "the pact",
                "the poet",
                "the rabid rhoa",
                "the road to power",
                "the siren",
                "the survivalist",
                "the tyrant",
                "the void",
                "the warlord",
                "the saint's treasure",
                "the wolverine",
                "might is right",
                "the obscured",
                "the breach",
                "the dreamer",
                "the jeweller's boon",
                "the hale heart",
                "perfection",
                "the master",
                "the undaunted",
                "the darkest dream",
                "the celestial stone",
                "the undisputed",
                "harmony of souls",
                "the innocent",
                "the twilight moon",
                "the mad king",
                "the landing",
                "the life thief",
                "burning blood",
                "the deep ones",
                "buried treasure",
                "the deal",
                "the side quest",
                "more is never enough",
                "divine justice",
                "deathly designs",
                "etched in blood",
                "the easy stroll",
                "peaceful moments",
                "the hive of knowledge",
                "society's remorse",
                "reckless ambition",
                "keeper's corruption",
                "brush, paint and palette",
                "the enthusiasts",
                "the card sharp",
                "the offspring",
                "lachrymal necrosis",
                "costly curio",
                "ambitious obsession",
                "guardian's challenge",
                "desperate crusade",
                "the prince of darkness",
                "parasitic passengers",
                "silence and frost",
                "from bone to ashes",
                "the dungeon master",
                "rebirth and renewal",
                "azure rage",
                "checkmate",
                "lethean temptation",
                "ever-changing",
                "man with bear",
                "gift of the gemling queen",
                "the tinkerer's table",
                "the whiteout",
                "heterochromia",
                "the gladiator",
                "the fortunate",
                "endless night",
                "the traitor",
                "the aesthete",
                "the lord in black",
                "the lord of celebration",
                "the arena champion",
                "no traces",
                "the inoculated",
                "the feast",
                "death",
                "the body",
                "the incantation",
                "the risk",
                "demigod's wager",
                "earth drinker",
                "the hoarder",
                "the price of protection",
                "prometheus' armoury",
                "the cursed king",
                "the archmage's right hand",
                "the cataclysm",
                "the wolf",
                "the fox in the brambles",
                "the fool",
                "the visionary",
                "treasure hunter",
                "the deceiver",
                "dark temptation",
                "the lion",
                "the flora's gift",
                "the forsaken",
                "the summoner",
                "the rite of elements",
                "boundless realms",
                "cartographer's delight",
                "coveted possession",
                "destined to crumble",
                "emperor of purity",
                "grave knowledge",
                "hope",
                "hubris",
                "light and truth",
                "lucky connections",
                "lysah's respite",
                "scholar of the seas",
                "shard of fate",
                "the betrayal",
                "the dapper prodigy",
                "the encroaching darkness",
                "the endurance",
                "the explorer",
                "the fletcher",
                "the inventor",
                "the lich",
                "the one with all",
                "the penitent",
                "the queen",
                "the scavenger",
                "the sigil",
                "the spoiled prince",
                "the surgeon",
                "the surveyor",
                "the throne",
                "the twins",
                "the union",
                "the valkyrie",
                "the warden",
                "the watcher",
                "the web",
                "thunderous skies",
                "time-lost relic",
                "turn the other cheek",
                "mitts",
                "the wretched",
                "the coming storm",
                "the wolven king's bite",
                "the spark and the flame",
                "atziri's arsenal",
                "struck by lightning",
                "the realm",
                "left to fate",
                "the insatiable",
                "forbidden power",
                "three voices",
                "the beast",
                "the sword king's salute",
                "the fathomless depths",
                "the dreamland",
                "immortal resolve",
                "the admirer",
                "the witch",
                "boon of the first ones",
                "the wilted rose",
                "the cacophony",
                "the master artisan",
                "a dab of ink",
                "sambodhi's vow",
                "arrogance of the vaal",
                "alone in the darkness",
                "the journey",
                "the messenger",
                "thirst for knowledge",
                "echoes of love",
                "the mountain",
                "the skeleton",
                "the wolf's legacy",
                "cameria's cut",
                "baited expectations",
                "a note in the wind",
                "the unexpected prize",
                "the cache",
                "acclimatisation",
                "a sea of blue",
                "the blessing of moosh",
                "disdain",
                "the tireless extractor",
                "the transformation",
                "the magma crab",
                "misery in darkness",
                "astral protection",
                "alivia's grace",
                "the calling",
                "the ruthless ceinture",
                "the sun",
                "the army of blood",
                "the journalist",
                "the dragon",
                "volatile power",
                "gemcutter's promise",
                "the adventuring spirit",
                "hunter's resolve",
                "the stormcaller",
                "loyalty",
                "the wolf's shadow",
                "triskaidekaphobia",
                "the lover",
                "the tower",
                "the scarred meadow",
                "jack in the box",
                "the opulent",
                "boon of justice",
                "vile power",
                "glimmer of hope",
                "broken truce",
                "lingering remnants",
                "the standoff",
                "assassin's favour",
                "doedre's madness",
                "emperor's luck",
                "her mask",
                "humility",
                "lantador's lost love",
                "prosperity",
                "rain of chaos",
                "rain tempter",
                "rats",
                "the carrion crow",
                "the catalyst",
                "the chains that bind",
                "the demoness",
                "the doppelganger",
                "the gambler",
                "the gemcutter",
                "the harvester",
                "the hermit",
                "the king's blade",
                "the lunaris priestess",
                "the metalsmith's gift",
                "the scholar",
                "the trial",
                "the wrath",
                "three faces in the dark",
                "vinia's token",
                "the blazing fire",
                "the puzzle",
                "vanity",
                "the craving",
                "cursed words",
                "the finishing touch",
                "imperial legacy",
                "brother's gift",
            ]),
        },
        scarab: {
            items: new Set([
                "winged ambush scarab",
                "winged divination scarab",
                "winged reliquary scarab",
                "winged harbinger scarab",
                "winged abyss scarab",
                "winged bestiary scarab",
                "winged legion scarab",
                "winged breach scarab",
                "winged blight scarab",
                "winged expedition scarab",
                "winged cartography scarab",
                "winged shaper scarab",
                "winged torment scarab",
                "winged sulphite scarab",
                "winged metamorph scarab",
                "winged elder scarab",
                "gilded divination scarab",
                "gilded ambush scarab",
                "gilded harbinger scarab",
                "gilded legion scarab",
                "gilded expedition scarab",
                "polished harbinger scarab",
                "gilded blight scarab",
                "gilded breach scarab",
                "gilded cartography scarab",
                "gilded reliquary scarab",
                "gilded metamorph scarab",
                "gilded abyss scarab",
                "gilded bestiary scarab",
                "gilded sulphite scarab",
                "polished divination scarab",
                "gilded torment scarab",
                "polished ambush scarab",
                "gilded shaper scarab",
                "polished legion scarab",
                "polished cartography scarab",
                "gilded elder scarab",
                "polished sulphite scarab",
                "polished breach scarab",
                "polished abyss scarab",
                "polished blight scarab",
                "polished expedition scarab",
                "polished metamorph scarab",
                "rusted divination scarab",
                "rusted harbinger scarab",
                "rusted legion scarab",
                "rusted cartography scarab",
                "rusted elder scarab",
                "rusted ambush scarab",
                "polished shaper scarab",
                "polished torment scarab",
                "polished elder scarab",
                "polished bestiary scarab",
                "polished reliquary scarab",
                "rusted sulphite scarab",
                "rusted expedition scarab",
                "rusted reliquary scarab",
                "rusted blight scarab",
                "rusted bestiary scarab",
                "rusted torment scarab",
                "rusted breach scarab",
                "rusted shaper scarab",
                "rusted metamorph scarab",
                "rusted abyss scarab",
            ]),
        },
        "delirium orb": {
            items: new Set([
                "skittering delirium orb",
                "diviner's delirium orb",
                "fine delirium orb",
                "cartographer's delirium orb",
                "fragmented delirium orb",
                "abyssal delirium orb",
                "singular delirium orb",
                "fossilised delirium orb",
                "thaumaturge's delirium orb",
                "foreboding delirium orb",
                "amorphous delirium orb",
                "blacksmith's delirium orb",
                "blighted delirium orb",
                "timeless delirium orb",
                "whispering delirium orb",
                "imperial delirium orb",
                "jeweller's delirium orb",
                "obscured delirium orb",
                "armoursmith's delirium orb",
            ]),
        },
        invitation: {
            items: new Set([
                "incandescent invitation",
                "screaming invitation",
                "maven's invitation: the elderslayers",
                "maven's invitation: the formed",
                "maven's invitation: the twisted",
                "maven's invitation: the hidden",
                "maven's invitation: the feared",
                "maven's invitation: the forgotten",
                "polaric invitation",
                "maven's invitation: the atlas",
                "writhing invitation",
            ]),
        },
        breach: {
            items: new Set([
                "chayula's flawless breachstone",
                "esh's flawless breachstone",
                "uul-netol's flawless breachstone",
                "xoph's flawless breachstone",
                "chayula's pure breachstone",
                "tul's flawless breachstone",
                "chayula's enriched breachstone",
                "uul-netol's pure breachstone",
                "xoph's pure breachstone",
                "tul's pure breachstone",
                "esh's pure breachstone",
                "xoph's enriched breachstone",
                "uul-netol's enriched breachstone",
                "chayula's charged breachstone",
                "uul-netol's charged breachstone",
                "esh's enriched breachstone",
                "tul's enriched breachstone",
                "uul-netol's breachstone",
                "chayula's breachstone",
                "esh's charged breachstone",
                "xoph's charged breachstone",
                "tul's charged breachstone",
                "xoph's breachstone",
                "tul's breachstone",
                "esh's breachstone",
                "splinter of uul-netol",
                "splinter of chayula",
                "splinter of xoph",
                "splinter of tul",
                "splinter of esh",
            ]),
        },
        fragment: {
            items: new Set([
                "visceral reliquary key",
                "forgotten reliquary key",
                "archive reliquary key",
                "oubliette reliquary key",
                "cosmic reliquary key",
                "shiny reliquary key",
                "voidborn reliquary key",
                "gift to the goddess",
                "the maven's writ",
                "fragment of shape",
                "fragment of knowledge",
                "sacred blossom",
                "fragment of emptiness",
                "timeless maraketh emblem",
                "dedication to the goddess",
                "unrelenting timeless maraketh emblem",
                "simulacrum",
                "fragment of eradication",
                "unrelenting timeless eternal emblem",
                "fragment of enslavement",
                "fragment of constriction",
                "fragment of purification",
                "al-hezmin's crest",
                "baran's crest",
                "drox's crest",
                "veritania's crest",
                "crescent splinter",
                "unrelenting timeless templar emblem",
                "fragment of the phoenix",
                "fragment of the hydra",
                "timeless templar emblem",
                "fragment of the minotaur",
                "mortal ignorance",
                "tribute to the goddess",
                "unrelenting timeless karui emblem",
                "unrelenting timeless vaal emblem",
                "mortal rage",
                "mortal hope",
                "fragment of the chimera",
                "mortal grief",
                "timeless vaal emblem",
                "timeless karui emblem",
                "fragment of terror",
                "divine vessel",
                "sacrifice at midnight",
                "sacrifice at noon",
                "offering to the goddess",
                "sacrifice at dawn",
                "timeless eternal emblem",
                "timeless maraketh splinter",
                "timeless templar splinter",
                "sacrifice at dusk",
                "timeless karui splinter",
                "timeless vaal splinter",
                "timeless eternal empire splinter",
                "simulacrum splinter",
            ]),
        },
        invocation: {
            items: new Set([
                "lycia's invocation of avatar of fire",
                "lycia's invocation of runebinder",
                "lycia's invocation of perfect agony",
                "lycia's invocation of hex master",
                "lycia's invocation of minion instability",
                "lycia's invocation of imbalanced guard",
                "lycia's invocation of eternal youth",
                "lycia's invocation of solipsism",
                "lycia's invocation of blood magic",
                "lycia's invocation of ghost reaver",
                "lycia's invocation of crimson dance",
                "lycia's invocation of arrow dancing",
                "lycia's invocation of versatile combatant",
                "lycia's invocation of divine shield",
                "lycia's invocation of iron grip",
                "lycia's invocation of precise technique",
                "lycia's invocation of acrobatics",
                "lycia's invocation of vaal pact",
                "lycia's invocation of iron will",
                "lycia's invocation of zealot's oath",
                "lycia's invocation of wicked ward",
                "lycia's invocation of ancestral bond",
                "lycia's invocation of point blank",
                "lycia's invocation of the agnostic",
                "lycia's invocation of the impaler",
                "lycia's invocation of pain attunement",
                "lycia's invocation of mind over matter",
                "lycia's invocation of wind dancer",
                "lycia's invocation of supreme ego",
                "lycia's invocation of resolute technique",
                "lycia's invocation of conduit",
                "lycia's invocation of ghost dance",
                "lycia's invocation of call to arms",
                "lycia's invocation of eldritch battery",
                "lycia's invocation of elemental equilibrium",
                "lycia's invocation of elemental overload",
                "lycia's invocation of glancing blows",
                "lycia's invocation of iron reflexes",
                "lycia's invocation of lethe shade",
                "lycia's invocation of magebane",
                "lycia's invocation of unwavering stance",
            ]),
        },
        catalyst: {
            items: new Set([
                "intrinsic catalyst",
                "noxious catalyst",
                "fertile catalyst",
                "turbulent catalyst",
                "imbued catalyst",
                "abrasive catalyst",
                "tempering catalyst",
                "prismatic catalyst",
                "accelerating catalyst",
                "unstable catalyst",
            ]),
        },
        essence: {
            items: new Set([
                "essence of horror",
                "essence of delirium",
                "essence of insanity",
                "essence of hysteria",
                "deafening essence of loathing",
                "deafening essence of contempt",
                "deafening essence of envy",
                "deafening essence of sorrow",
                "deafening essence of zeal",
                "deafening essence of woe",
                "deafening essence of greed",
                "deafening essence of hatred",
                "deafening essence of rage",
                "deafening essence of scorn",
                "deafening essence of spite",
                "shrieking essence of dread",
                "shrieking essence of loathing",
                "deafening essence of anger",
                "deafening essence of dread",
                "deafening essence of fear",
                "deafening essence of misery",
                "deafening essence of torment",
                "deafening essence of wrath",
                "shrieking essence of greed",
                "deafening essence of doubt",
                "deafening essence of suffering",
                "shrieking essence of contempt",
                "shrieking essence of envy",
                "shrieking essence of rage",
                "shrieking essence of scorn",
                "shrieking essence of sorrow",
                "shrieking essence of spite",
                "shrieking essence of woe",
                "shrieking essence of zeal",
                "shrieking essence of wrath",
                "shrieking essence of anger",
                "shrieking essence of fear",
                "remnant of corruption",
                "shrieking essence of hatred",
                "deafening essence of anguish",
                "muttering essence of anger",
                "muttering essence of contempt",
                "muttering essence of fear",
                "muttering essence of greed",
                "muttering essence of hatred",
                "muttering essence of sorrow",
                "muttering essence of torment",
                "muttering essence of woe",
                "screaming essence of dread",
                "screaming essence of envy",
                "screaming essence of greed",
                "screaming essence of loathing",
                "shrieking essence of misery",
                "shrieking essence of torment",
                "wailing essence of anguish",
                "wailing essence of contempt",
                "wailing essence of doubt",
                "wailing essence of fear",
                "wailing essence of greed",
                "wailing essence of hatred",
                "wailing essence of loathing",
                "wailing essence of rage",
                "wailing essence of sorrow",
                "wailing essence of spite",
                "wailing essence of suffering",
                "wailing essence of torment",
                "wailing essence of woe",
                "wailing essence of wrath",
                "wailing essence of zeal",
                "weeping essence of anger",
                "weeping essence of contempt",
                "weeping essence of doubt",
                "weeping essence of fear",
                "weeping essence of greed",
                "weeping essence of hatred",
                "weeping essence of rage",
                "weeping essence of sorrow",
                "weeping essence of suffering",
                "weeping essence of torment",
                "weeping essence of woe",
                "weeping essence of wrath",
                "whispering essence of contempt",
                "whispering essence of greed",
                "whispering essence of hatred",
                "whispering essence of woe",
                "wailing essence of anger",
                "screaming essence of anger",
                "shrieking essence of anguish",
                "screaming essence of zeal",
                "screaming essence of sorrow",
                "screaming essence of fear",
                "screaming essence of rage",
                "screaming essence of woe",
                "screaming essence of wrath",
                "shrieking essence of doubt",
                "screaming essence of contempt",
                "screaming essence of hatred",
                "screaming essence of scorn",
                "screaming essence of spite",
                "shrieking essence of suffering",
                "screaming essence of misery",
                "screaming essence of doubt",
                "screaming essence of torment",
                "screaming essence of anguish",
                "screaming essence of suffering",
            ]),
        },
    };

    group(item: PoeItem): InternalGroup | null {
        const typeLine = item.typeLine?.toLowerCase() ?? "";

        for (const [key, value] of Object.entries(this.currencyGroupIds)) {
            if (value.items.has(typeLine)) {
                return {
                    key: typeLine,
                    tag: key,
                    hashProperties: {},
                };
            }
        }

        return null;
    }
}
