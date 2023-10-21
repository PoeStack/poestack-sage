import {map, Observable, pipe, Subject, tap} from "rxjs";
import {PoeApiStashTab} from "./ggg-models";
import {ajax} from 'rxjs/ajax';
import axios from "axios";

export class StashApi {

    public stashTabs$: Subject<PoeApiStashTab[]> = new Subject()

    public load(): Observable<PoeApiStashTab[]> {
        return new Observable<PoeApiStashTab[]>((observer) => {
            axios.get('http://localhost:3000/stash/Ancestor/stashes')
                .then((response) => {
                    observer.next(response.data);
                    observer.complete();
                })
                .catch((error) => {
                    observer.error(error);
                });
        }).pipe(
            tap((e) => this.stashTabs$.next(e))
        )
    }
}