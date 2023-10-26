import {Observable} from "rxjs";
import axios from "axios";

export class HttpUtil {

    gggApiEndpoint = process.env['GGG_API_ENDPOINT'] ?? 'https://api.pathofexile.com'
    token = process.env['GGG_TOKEN']

    private client = axios.create({adapter: "http"})

    public get<T>(path: string): Observable<T> {
        return new Observable((observer) => {
            this.client.get(`${this.gggApiEndpoint}${path}`, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "User-Agent": "OAuth poestack/2.0.0 (contact: zgherridge@gmail.com)",
                }
            })
                .then((response) => {
                    observer.next(response.data);
                    observer.complete();
                })
                .catch((error) => {
                    observer.error(error);
                });
        })
    }
}

export const GGG_API_UTIL = new HttpUtil()