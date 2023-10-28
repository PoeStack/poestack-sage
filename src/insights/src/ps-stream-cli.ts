import "reflect-metadata";

require('dotenv').config()

import {container} from "tsyringe";
import {PoeApiPublicStashResponse} from "@gql/resolvers-types";

import {GGGStashStreamProvider, PublicStashStreamProvider} from "./services/public-stash-stream-providers";
import ItemGroupingService from "./services/item-grouping-service";
import Redis from "ioredis";

(async () => {
    const streamProvider: PublicStashStreamProvider = container.resolve(GGGStashStreamProvider);
    await streamProvider.init();

    const itemGroupingService = container.resolve(ItemGroupingService);

    const client = new Redis({
        host: "redis-sviluppo.lgibek.0001.use1.cache.amazonaws.com",
        port: 6379,
        tls: undefined
    });

    let last = ''
    for (; ;) {
        try {
            if (last?.length) {
                const tr = await client.hgetall(last)
                console.log("test hget", JSON.stringify(tr))
            }

            const data: PoeApiPublicStashResponse = await streamProvider.nextUpdate();
            if (data?.stashes) {
                const dateMs = Date.now();
                const dateTurncatedMins = Math.round(dateMs / 1000 / 60);
                let updates = 0;
                const multi = client.multi();
                for (const stashData of data.stashes) {
                    if (!stashData.league || stashData.league.includes('(PL') || stashData.league.includes("SSF ") || stashData.league.includes("Ruthless ")) {
                        continue;
                    }

                    const toWrite: Record<string, { stackSize: number, value: string, currencyType: string }> = {};
                    for (const item of stashData.items) {
                        const note = item.note ?? item.forum_note ?? stashData.stash;
                        if (note.length > 3 && (note.includes("~b/o ") || note.includes("~price "))) {
                            const group = itemGroupingService.findOrCreateItemGroup(item);
                            if (group) {
                                if (!toWrite[group.hashString]) {
                                    toWrite[group.hashString] = {stackSize: 0, value: '', currencyType: ''};
                                }

                                if (group.parentHashString === null) {
                                    const mappingKey = `igmk:${group.key}`
                                    multi
                                        .set(mappingKey, group.hashString)
                                        .expire(mappingKey, 60 * 60 * 60)
                                }

                                const noteSplit = note.trim().split(" ");
                                const valueString = noteSplit[1];
                                const currenyType = noteSplit[2]?.toLowerCase();

                                if (valueString?.length > 0 && currenyType?.length > 2) {
                                    toWrite[group.hashString].stackSize = toWrite[group.hashString].stackSize + (item.stackSize ?? 1);
                                    toWrite[group.hashString].value = valueString;
                                    toWrite[group.hashString].currencyType = currenyType;
                                }
                            }
                        }
                    }

                    for (const [itemGroupHashString, data] of Object.entries(toWrite)) {
                        updates++;
                        const groupKey = `psEntries:${stashData.league}:${itemGroupHashString}`;
                        last = groupKey
                        multi
                            .hset(groupKey, stashData.accountName, `${dateTurncatedMins},${data.stackSize},${data.value},${data.currencyType}`)
                            .expire(groupKey, 60 * 60 * 48)
                    }
                }

                if (updates > 0) {
                    Promise.all(
                        [
                            multi.exec()
                        ]
                    ).catch((e) => {
                        console.log("error in write", e)
                    }).finally(() => {
                        console.log("finished", updates, "updates in", Date.now() - dateMs, "ms");
                    })
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
})
();