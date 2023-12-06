import { drizzle } from 'drizzle-orm/libsql'
import { eq } from 'drizzle-orm'
import { RootStore } from '../store/rootStore'
import { SnapshotOutOfModel } from 'mobx-keystone'
import * as schema from './schema'

// @ts-ignore
const client = window.api['@libsql/client'].createClient({
  // TODO: Change for production
  url: 'file:../echo-plugins/networth-plugin/database.db'
})

const db = drizzle(client, { schema })

export const initDrizzle = async () => {
  // @ts-ignore
  await window.api['drizzle-orm/libsql/migrator'].migrate(db, {
    // TODO: Change for production
    migrationsFolder: '../echo-plugins/networth-plugin/src/db/migrations'
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
