import { drizzle } from 'drizzle-orm/libsql'
import { eq } from 'drizzle-orm'
import { RootStore } from '../store/rootStore'
import { SnapshotOutOfModel } from 'mobx-keystone'
import * as schema from './schema'
import path from 'path'
import * as os from 'os'
import * as fs from 'fs'

function getHomeDir() {
  return path.resolve(os.homedir(), 'poestack-sage')
}

function ensureDirExists(...dirPathFragment: string[]) {
  const resolved = path.resolve(getHomeDir(), ...dirPathFragment)
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true })
  }
  return resolved
}

let networthPluginPath = '../echo-plugins/networth-plugin'
let migrationsFolder = '../echo-plugins/networth-plugin/src/db/migrations'
if (!import.meta.env?.DEV) {
  networthPluginPath = ensureDirExists('cache', 'plugins', 'networth-plugin')
  migrationsFolder = ensureDirExists('plugins', 'networth-plugin', 'migrations')
}
// @ts-ignore
const client = window.api['@libsql/client'].createClient({
  url: `file:${path.join(networthPluginPath, 'database.db')}`
})

const db = drizzle(client, { schema })

export const initDrizzle = async () => {
  // @ts-ignore
  await window.api['drizzle-orm/libsql/migrator'].migrate(db, {
    migrationsFolder: migrationsFolder
  })
  return db.insert(schema.rootStore).values({ id: 1, root: null }).onConflictDoNothing().execute()
}

export const getRootSnapshot = async () => {
  return db
    .select({ root: schema.rootStore.root })
    .from(schema.rootStore)
    .limit(1)
    .execute()
    .then((data) => data[0].root)
}

export const saveRootSnapshot = (data: SnapshotOutOfModel<RootStore>) => {
  return db.update(schema.rootStore).set({ root: data }).where(eq(schema.rootStore.id, 1)).execute()
}

export const resetAll = () => {
  return db.delete(schema.rootStore).where(eq(schema.rootStore.id, 1)).execute()
}
