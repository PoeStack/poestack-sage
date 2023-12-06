import { AnySnapshot } from './types'

export function isString(value: any): value is string {
  return typeof value === 'string'
}

export function isSnapshot(value: any): value is AnySnapshot {
  return value && value.$modelId !== undefined
}

export function isPromise(maybePromise: any): maybePromise is PromiseLike<any> {
  return 'then' in maybePromise
}
