import Redis from 'ioredis'
import { scanKeys } from "./utils";
import { from, mergeMap, tap } from 'rxjs';

const client = new Redis(process.env['REDIS_URL'])

scanKeys(client, "*cluster*").pipe(
  tap((e) => console.log("deleting", e)),
  mergeMap((key) => from(client.del(key)))

).subscribe()

