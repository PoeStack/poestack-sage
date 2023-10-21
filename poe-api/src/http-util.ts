import {Observable} from "rxjs";
import axios from "axios";

export class HttpUtil {

    public static get<T>(path: string): Observable<T> {
        return new Observable((observer) => {
            axios.get(`http://localhost:3000${path}`)
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