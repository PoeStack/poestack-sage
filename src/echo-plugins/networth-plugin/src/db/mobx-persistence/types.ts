export type VersionCode = number

export type AnySnapshot = Record<string, any>

export type PersistedState = {
  version: VersionCode
  snapshot: AnySnapshot
}

export type Migrator = (
  state: Readonly<PersistedState>,
  version: VersionCode
) => Promise<PersistedState>

export type MigrationManifest = Record<VersionCode, Migration>

export type Migration = (snapshot: Readonly<AnySnapshot>) => AnySnapshot | Promise<AnySnapshot>
