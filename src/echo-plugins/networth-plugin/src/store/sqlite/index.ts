import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { rootStore } from './tables/rootStore'
import { eq } from 'drizzle-orm'
import { RootStore } from '../rootStore'
import { SnapshotOutOfModel } from 'mobx-keystone'

const client = createClient({ url: 'file:../../database.sql' })

const db = drizzle(client)

export const initTables = () => {
  return db.insert(rootStore).values({ id: 'root', root: null }).onConflictDoNothing().execute()
}

export const getRootSnapshot = async () => {
  return db
    .select({ root: rootStore.root })
    .from(rootStore)
    .limit(1)
    .execute()
    .then((data) => data[0].root)
}

export const saveRootSnapshot = (data: SnapshotOutOfModel<RootStore>) => {
  return db.update(rootStore).set({ root: data }).where(eq(rootStore.id, 'root')).execute()
}
