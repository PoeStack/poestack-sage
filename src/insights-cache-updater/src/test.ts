import * as AWS from "aws-sdk";
import Redis from "ioredis";
import {from, groupBy, GroupedObservable, map, mergeMap, Observable, of, tap, toArray} from "rxjs";
import * as process from "process";

const client = new Redis({
    host: process.env['REDIS_URL'],
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

type Listing = {
    itemGroupHash: string,
    profileName: string,
    timestamp: number,
    quantity: number,
    value: number,
    valueCurrency: string
}

type Valuation = {
    p15: number
}

type GroupValuation = {
    league: string,
    tag: string,
    itemGroupHash: string,
    valuation: Valuation
}

function valueListings(group: GroupedObservable<string, Listing>): Observable<Valuation> {
    return group.pipe(
        toArray(),
        map((e) => {
            return {p15: e[0].value}
        })
    )
}

function valueShard(shardKey: string): Observable<{ key: string, valuations: GroupValuation[] }> {
    const [version, tag, shard, league] = shardKey.split(":")

    return from(client.hgetall(shardKey)).pipe(
        mergeMap((e) => Object.entries(e)),
        map(([k, v]): Listing => {
            const [hash, profileName] = k.split(":")
            const [timestamp, quantity, value, valueCurrency] = v.split(",")

            return {
                itemGroupHash: hash,
                profileName: profileName,
                quantity: parseInt(quantity),
                timestamp: parseInt(timestamp),
                value: parseFloat(value),
                valueCurrency: valueCurrency
            }
        }),
        groupBy((e) => e.itemGroupHash),
        mergeMap((e) => valueListings(e).pipe(
                map((v): GroupValuation => ({
                    league: league,
                    itemGroupHash: e.key,
                    tag: tag,
                    valuation: v
                }))
            )
        ),
        toArray(),
        map((e) => ({key: `${tag}_${shard}_${league}`, valuations: e}))
    )
}


function writeShard(e: { key: string, valuations: GroupValuation[] }) {
    const output = {}

    for (const valuation of e.valuations) {
        output[valuation.itemGroupHash] = valuation.valuation.p15
    }

    return from(s3bucket.putObject({
        Bucket: 'sage-insights-cache',
        Key: `v1/${e.key}.json`,
        Body: JSON.stringify(output),
        ContentType: "application/json",
    }).promise())
}

scanKeys("psev5:*")
    .pipe(
        mergeMap((e) => valueShard(e), 5),
        tap((e) => console.log("writing", e.key, e.valuations.length)),
        mergeMap((e) => writeShard(e), 5)
    )
    .subscribe({
        complete: () => {
            client.disconnect(false)
        }
    })