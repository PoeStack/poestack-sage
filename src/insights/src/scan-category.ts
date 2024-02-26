import Redis from 'ioredis'
import { scanKeys } from "./utils";
import { from, mergeMap, tap } from 'rxjs';

const client = new Redis(process.env['REDIS_URL'])

scanKeys(client, "*cluster*").pipe(
  mergeMap(
    (key) => from(client.hgetall(key)),
    (i, o) => ({ key: i, value: o })
  )
).subscribe((e) => {
  console.log(e)
})


