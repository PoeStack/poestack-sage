import * as AWS from "aws-sdk";
import Redis from "ioredis";
import {concatMap, from, last, map, mergeMap, Observable, of, range, scan, tap} from "rxjs";
import * as process from "process";

const client = new Redis({
    host: "sage-redis-cluster-3.lgibek.0001.use1.cache.amazonaws.com",
    port: 6379,
    tls: undefined
});

function scanKeys(pattern: string): Observable<string> {
    return new Observable<string>((sub) => {
        const scan = client.scanStream({match: pattern})
        scan.on("data", (keys) => {
            for (const key of keys) {
                sub.next(key);
            }
        });

        scan.on('error', (error) => {
            sub.error(error);
        });

        scan.on('end', () => {
            sub.complete();
        });
    })
}


const dateMs = Date.now()
const dateTruncatedMins = Math.round(dateMs / 1000 / 60);

AWS.config.update({region: 'us-east-1'})
const s3bucket = new AWS.S3();

function run(tag: string, shard: string, league: string) {
    return scanKeys(`psEntries:${tag}:${shard}:${league}:*`)
        .pipe(
            mergeMap((key) =>
                from(client.hgetall(key)).pipe(
                    map((result) => ({key, result}))
                )
            ),
            scan((sharedOutput, listings) => {
                const output = [];
                for (const listing of Object.values(listings.result)) {
                    const [timestamp, quantity, value, currencyType] = listing.split(",")
                    output.push(
                        ...[dateTruncatedMins - parseInt(timestamp),
                            quantity,
                            value,
                            currencyType]
                    )
                }
                const itemGroupHashKey = listings.key.split(":")[4]
                return {...sharedOutput, [itemGroupHashKey]: output.join(",")}
            }, {}),
            last(null, {}),
            tap((e) => console.log("last", Object.keys(e).length)),
            mergeMap((e) => from(s3bucket.putObject({
                Bucket: 'sage-insights-cache',
                Key: `${tag}_${shard}_${league}.json`,
                Body: JSON.stringify({
                    timestamp: dateTruncatedMins,
                    listings: e
                }),
                ContentType: "application/json",
            }).promise()))
        )
}


of('currency', 'unique').pipe(
    concatMap(item1 => range(0, 102).pipe(
        concatMap(item2 => of([item1, item2.toString()]))
    )),
    tap((e) => console.log("starting", e)),
    concatMap(([tag, shard]) => run(tag, shard.toString(), "Ancestor"))
).subscribe({
    complete: () => {
        client.disconnect(false)
    }
})