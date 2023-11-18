import { BehaviorSubject, Observable } from 'rxjs'
import axios from 'axios'

export class GggHttpUtil {
  public tokenSubject$ = new BehaviorSubject(process.env['GGG_TOKEN'])
  public gggApiEndpoint = process.env['GGG_API_ENDPOINT'] ?? 'https://api.pathofexile.com'

  private client = axios.create({ adapter: 'http' })

  public get<T>(path: string): Observable<T> {
    return new Observable((observer) => {
      this.client
        .get(`${this.gggApiEndpoint}${path}`, {
          headers: {
            Authorization: `Bearer ${this.tokenSubject$.value}`,
            'User-Agent': 'OAuth poestack/2.0.0 (contact: zgherridge@gmail.com)'
          }
        })
        .then((response) => {
          console.log('GGG response', path, response.status)
          observer.next(response.data)
          observer.complete()
        })
        .catch((error) => {
          console.log('GGG response - error')
          observer.error(error)
        })
    })
  }
}
