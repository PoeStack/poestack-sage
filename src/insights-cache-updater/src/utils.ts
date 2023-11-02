import {Observable} from "rxjs";
import Redis from "ioredis";

export function scanKeys(client: Redis, pattern: string): Observable<string> {
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
