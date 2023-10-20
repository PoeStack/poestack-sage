import {interval, Subject} from "rxjs";

export class PoeLogEventsApi {
    public logEvents$: Subject<string> = new Subject<string>();

    public startTestEvents() {
        interval(1000).subscribe((i) => {
            this.logEvents$.next(`test event ` + i)
        })
    }
}