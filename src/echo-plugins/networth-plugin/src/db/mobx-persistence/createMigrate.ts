import { Migrator, MigrationManifest } from './types'
import { DEFAULT_VERSION } from './constants'
import { isPromise } from './utils'

export function createMigrate(
  migrations: MigrationManifest,
  options?: { debug: boolean }
): Migrator {
  const { debug } = options || {}

  return async (state, currentVersion) => {
    const inboundVersion = state.version !== undefined ? state.version : DEFAULT_VERSION

    if (inboundVersion === currentVersion) {
      if (process.env.NODE_ENV !== 'production' && debug)
        console.log('mobx-keystone-persist: versions match, noop migration')
      return state
    }

    if (inboundVersion > currentVersion) throw new Error('downgrading version is not supported')

    const migrationKeys = Object.keys(migrations)
      .map((ver) => parseInt(ver))
      .filter((key) => currentVersion >= key && key > inboundVersion)
      .sort((a, b) => a - b)

    if (process.env.NODE_ENV !== 'production' && debug)
      console.log('mobx-keystone-persist: migrationKeys', migrationKeys)

    for (const versionKey of migrationKeys) {
      if (process.env.NODE_ENV !== 'production' && debug)
        console.log('mobx-keystone-persist: running migration for versionKey', versionKey)

      const snapshotOrPromise = migrations[versionKey](state.snapshot)

      state = {
        version: versionKey,
        snapshot: isPromise(snapshotOrPromise) ? await snapshotOrPromise : snapshotOrPromise
      }
    }

    return state
  }
}
