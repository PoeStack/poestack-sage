import { Observable } from 'rxjs'
import axios, { AxiosRequestConfig } from 'axios'

export class HttpUtil {
  private client = axios.create({ adapter: 'http' })


  public post(url: string, body: any, config: AxiosRequestConfig = { headers: {} }) {
    return new Observable((observer) => {
      this.client.post(url, body, config)
        .then((resp) => {
          observer.next(resp)
          observer.complete()
        })
        .catch((error) => {
          observer.error(error)
          observer.complete()
        })
    })
  }

  public get<T>(url: string, config: AxiosRequestConfig = { headers: {} }): Observable<T> {
    return new Observable((observer) => {
      console.log('firing', url)
      this.client
        .get(url, config)
        .then((response) => {
          console.log('res', url, response.status)
          observer.next(response.data)
          observer.complete()
        })
        .catch((error) => {
          console.log('http util error for', url, error)
          observer.error(error)
          observer.complete()
        })
    })
  }
}

export const HTTP_UTIL = new HttpUtil()
