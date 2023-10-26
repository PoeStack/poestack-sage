import {groupBy, mergeMap, of, Subject} from 'rxjs';
import { throttleTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import * as subject from "rxjs";

const loadSubject = new Subject();

loadSubject
    .pipe(
        groupBy(item => item.key), // Group emissions by key
        mergeMap(group => group.pipe(throttleTime(10000))) // Throttle emissions for each key
    )
    .subscribe(data => {
        // Your custom function here
        console.log(`Processing key: ${data.key}`);
    });

// Example emissions:
loadSubject.next({ key: 'A' }); // This will be processed
loadSubject.next({ key: 'A' }); // This will be discarded within 10 seconds
loadSubject.next({ key: 'B' }); // This will be processed
loadSubject.next({ key: 'A' }); // This will be processed
loadSubject.next({ key: 'A' }); // This will be discarded within 10 seconds
loadSubject.next({ key: 'B' }); // This will be processed
loadSubject.next({ key: 'A' }); // This will be processed
loadSubject.next({ key: 'A' }); // This will be discarded within 10 seconds
loadSubject.next({ key: 'B' }); // This will be processed
loadSubject.next({ key: 'A' }); // This will be processed
loadSubject.next({ key: 'A' }); // This will be discarded within 10 seconds
loadSubject.next({ key: 'B' }); // This will be processed
loadSubject.next({ key: 'A' }); // This will be processed
loadSubject.next({ key: 'A' }); // This will be discarded within 10 seconds
loadSubject.next({ key: 'B' }); // This will be processed