import { model, Model, modelAction, prop, tProp, types } from 'mobx-keystone'
import { PersistWrapper } from '../utils/persist.utils'
import dayjs from 'dayjs'

const DEBUG = false

@model('nw/resourceHandle')
export class ResourceHandle extends Model(
  ...PersistWrapper(
    {
      borrowedAt: tProp(types.maybe(types.number)),
      releasedAt: tProp(types.maybe(types.number)),
      version: prop(1)
    },
    {
      whitelist: ['borrowedAt', 'releasedAt']
    }
  )
) {
  public promise!: Promise<void>

  private _tmid!: ReturnType<typeof setTimeout>
  private _cb!: () => void
  private _resolve!: () => void
  private _reject!: (reason?: any) => void

  @modelAction
  start(millis: number, cb: () => void) {
    if (!millis || !cb) return
    this.borrowedAt = dayjs.utc().valueOf()
    this.releasedAt = this.borrowedAt + millis
    this._cb = cb
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject

      this._tmid = setTimeout(() => {
        this._cb()
        this._resolve()
      }, millis)
    })
  }

  public get isRunning() {
    // @ts-ignore
    return Boolean(this._tmid && this.promise && this._cb && this._resolve && this._reject)
  }

  public cancel(reason?: any) {
    clearTimeout(this._tmid)
    this._cb()
    this._reject(reason)
  }

  // In case of retry-after
  public regenerate(millis: number) {
    if (!this.isRunning) {
      DEBUG && console.error('Trying to regenerate handle which is not running')
      return
    }
    clearTimeout(this._tmid)
    this.borrowedAt = dayjs.utc().valueOf()
    this.releasedAt = this.borrowedAt + millis
    this._tmid = setTimeout(() => {
      this._cb()
      this._resolve()
    }, millis)
  }

  // MobX restored
  public restore(cb: () => void) {
    const millis = dayjs.utc(this.releasedAt).diff(dayjs.utc())
    if (millis <= 0) return cb()
    this._cb = cb
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject

      this._tmid = setTimeout(() => {
        this._cb()
        this._resolve()
      }, millis)
    })
  }
}

@model('nw/rateLimitStore')
export class RateLimitStore extends Model(
  ...PersistWrapper(
    {
      retryAfterHandle: tProp(types.maybe(types.model(ResourceHandle))),
      retryAfter: tProp(types.maybe(types.number)),
      version: prop(1)
    },
    {
      whitelist: ['retryAfter']
    }
  )
) {
  @modelAction
  setRetryAfterHandle(handle?: ResourceHandle) {
    this.retryAfterHandle = handle
  }

  @modelAction
  setRetryAfter(millies: number) {
    this.retryAfter = millies === 0 ? 0 : dayjs.utc().add(millies, 'milliseconds').valueOf()
  }
}
