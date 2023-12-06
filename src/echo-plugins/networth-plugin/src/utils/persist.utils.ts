import {
  FromSnapshotDefaultType,
  ModelOptions,
  ModelProps,
  OptionalModelProp,
  modelIdKey,
  modelTypeKey
} from 'mobx-keystone'

// Reference: // https://github.com/Phault/mobx-keystone-persist/tree/master

type VersionCode = number

type AnySnapshot = { version: VersionCode } & Record<string, any>

type PersistedState = AnySnapshot

export interface IOptions<FS, TS> {
  readonly whitelist?: Array<string>
  readonly blacklist?: Array<string>
  migrate?: (state: FS) => TS
}

// export interface IMigrationArgs <TProps>{
//   (snapshot: AnySnapshot, options?: IOptions<TProps>): AnySnapshot
// }

export const migration = <FS, TS>(
  snapshot: AnySnapshot,
  options: IOptions<FS, TS> = {}
): AnySnapshot => {
  let { whitelist, blacklist, migrate } = options

  if (whitelist || blacklist) {
    const whitelistSet = new Set(whitelist || [])
    const blacklistSet = new Set(blacklist || [])
    Object.keys(snapshot).forEach((key) => {
      if (key === modelTypeKey || key === modelIdKey || key === 'version') {
        return
      }
      if (whitelist && !whitelistSet.has(key)) {
        delete snapshot[key]
      }
      if (blacklist && blacklistSet.has(key)) {
        delete snapshot[key]
      }
    })
  }

  let state: PersistedState = snapshot

  if (migrate) {
    // @ts-ignore
    state = migrate(snapshot)
  }

  console.log('Hydrated: ', state)
  return state
}

export function PersistWrapper<
  TProps extends ModelProps & { version: OptionalModelProp<number> },
  FS extends Record<string, any> = never,
  TS extends Record<string, any> = never
>(
  modelProps: TProps,
  options?: IOptions<FromSnapshotDefaultType<TProps>, FromSnapshotDefaultType<TProps>>
): [modelProps: TProps, modelOptions?: ModelOptions<TProps, FS, TS>] {
  return [
    modelProps,
    {
      fromSnapshotProcessor(snapshot: any): any {
        return migration(snapshot, options)
      }
      // TODO: Add persist function for outgoing snapshots
    }
  ]
}
