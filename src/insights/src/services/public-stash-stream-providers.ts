import PoeApi from "../poe/poe-api";
import {singleton} from "tsyringe";
import fs from "fs";
import os from "os";
import {PoeApiPublicStashResponse} from "../gql/__generated__/resolvers-types";

export interface PublicStashStreamProvider {
    init(): Promise<void>;

    nextUpdate(): Promise<PoeApiPublicStashResponse | null>;
}

@singleton()
export class GGGStashStreamProvider implements PublicStashStreamProvider {

    private lastChangeId;

    constructor(private poeApi: PoeApi) {
    }

    public async init() {
        const changeIds = "2145640831-2137918784-2068567059-2296748038-2229165629";
        this.lastChangeId = changeIds;
    }

    public async nextUpdate(): Promise<PoeApiPublicStashResponse | null> {
        const resp = await this.poeApi.fetchPublicStashChanges(
            process.env.GGG_SERVICE_AUTH_TOKEN,
            this.lastChangeId
        );

        if (resp.data) {
            this.lastChangeId = resp.data?.next_change_id;
            return resp.data;
        }

        if (resp.rateLimitedForMs > 0) {
            console.log("GGG rate-limited, sleeping for ", resp.rateLimitedForMs, "ms")
            await new Promise((res) => setTimeout(res, resp.rateLimitedForMs));
        }
    }
}

@singleton()
export class OfflineStashStreamProvider implements PublicStashStreamProvider {
    private reads = 0;

    async init() {
    }

    async nextUpdate(): Promise<PoeApiPublicStashResponse> {
        const data: PoeApiPublicStashResponse = JSON.parse(fs.readFileSync(os.homedir() + `/workplace/poe-offline-data/psstream/run-1/${this.reads++}.json`).toString());
        return data;
    }
}