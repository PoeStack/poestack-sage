import {PoePartialStashTab, PoeStashTab, GggApi} from "ggg-api";
import {CachedTask} from "./cached-task";

export class StashService {
    public gggApi: GggApi

    public currentStashes = new CachedTask<PoePartialStashTab[]>((key) => this.gggApi.getStashes(key))
    public currentStashContents = new CachedTask<PoeStashTab>((key) => this.gggApi.getStashContent(key.split("_")[0], key.split("_")[1]))

    constructor(stashApi: GggApi) {
        this.gggApi = stashApi
    }
}

export const STASH_SERVICE = new StashService(new GggApi())
