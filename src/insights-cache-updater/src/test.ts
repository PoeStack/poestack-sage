import * as AWS from "aws-sdk";
import Redis from "ioredis";
import {concatMap, from, last, map, Observable, scan} from "rxjs";


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

scanKeys("psEntries:currency:*:Ancestor:*")
    .pipe(
        concatMap((key) =>
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
        last()
    )
    .subscribe((e) => {
        AWS.config.update({region: 'us-east-1'})
        const s3bucket = new AWS.S3();

        s3bucket.putObject({
            Bucket: 'sage-insights-cache',
            Key: 'test.json',
            Body: JSON.stringify({
                timestamp: dateTruncatedMins,
                listings: e
            }),
            ContentType: "application/json",
        }, (err, data) => {
            console.log("error uploading", err)
        })
        console.log(Object.keys(e).length)
        client.disconnect(false)
    })