import {PoePartialStashTab, PoeStashTab, StashApi} from "ggg-api";
import {CachedTask} from "./cached-task";

export class StashService {
    public stashApi: StashApi

    public currentStashes = new CachedTask<PoePartialStashTab[]>((key) => this.stashApi.getStashes(key))
    public currentStashContents = new CachedTask<PoeStashTab>((key) => this.stashApi.getStashContent(key.split("_")[0], key.split("_")[1]))

    constructor(stashApi: StashApi) {
        console.log("Stash service constructed")
        this.stashApi = stashApi
    }
}

export const STASH_SERVICE = new StashService(new StashApi())
