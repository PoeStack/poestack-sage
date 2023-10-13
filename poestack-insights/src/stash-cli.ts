
import "reflect-metadata";
require('dotenv').config()

import { container } from "tsyringe";
import { PoeApiPublicStashResponse } from "@gql/resolvers-types";
import { createClient } from "redis";
import { GGGStashStreamProvider, PublicStashStreamProvider } from "./services/public-stash-stream-providers";
import ItemGroupingService from "./services/item-grouping-service";
import PoeApi from "./poe/poe-api";
import fs from "fs";
import os from "os";

(async () => {
    const client = await createClient({ url: process.env.REDIS_URL })
        .on('error', err => console.log('Redis Client Error', err))
        .connect();

    const poeApi = container.resolve(PoeApi);
    const stash = await poeApi.fetchStashTabs(process.env.GGG_ACCOUNT_AUTH_TOKEN, "Ancestor");
    console.log("stash", stash);

    fs.writeFileSync(os.homedir() + `/workplace/poe-offline-data/stash/run-1/tabs.json`, JSON.stringify(stash.data))


    const flatStashTabs = stash.data.flatMap(
        (stashTab) => {
            const res = stashTab.children
                ? stashTab.children
                : [stashTab];
            delete stashTab.children;
            return res;
        }
    );

    const tabIds = flatStashTabs
        .filter(
            (e) => !["MapStash", "UniqueStash"].includes(e.type)
        )
        .map((e) => e.id);


    for (const tab of tabIds) {
        const tabContents = await poeApi.fetchStashTab(process.env.GGG_ACCOUNT_AUTH_TOKEN, tab, null, "Ancestor")
        if (tabContents.data) {
            fs.writeFileSync(os.homedir() + `/workplace/poe-offline-data/stash/run-1/${tab}.json`, JSON.stringify(tabContents.data))
        }
        await new Promise(resolve => setTimeout(resolve, 15000));
    }

    console.log("Done")

    const itemGroupingService = container.resolve(ItemGroupingService);
})();