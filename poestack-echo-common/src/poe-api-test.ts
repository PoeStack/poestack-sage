import {StashApi} from "poe-api";
import {filterNullish} from "poestack-ts-ratchet";
import {
    catchError,
    concatMap,
    filter,
    from, map,
    mergeMap,
    Observable,
    of,
    OperatorFunction, pipe, tap,
    toArray,
    UnaryFunction
} from "rxjs";

const stashApi = new StashApi();

stashApi.stashContent$.subscribe((e) => console.log("loaded contents", e.id, e.items!.length))

stashApi.stashes$
    .pipe(
        map((e) => {
            return e.flatMap((t) => t.children ? t.children!.map((c) => c.id!) : [t.id!])
        }),
        mergeMap((ids) => stashApi.getStashContents("Ancestor", ids)),
        mergeMap((e) => from(e.items!)),
        toArray()
    ).subscribe((e) => console.log(e))

stashApi.getStashes("Ancestor").subscribe()
