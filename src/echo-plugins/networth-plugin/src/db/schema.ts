import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core'
import * as store from '../store/rootStore'
import { SnapshotOutOfModel } from 'mobx-keystone'
import { sql } from 'drizzle-orm'

// Save all data in one key/value
export const rootStore = sqliteTable('rootStore', {
  id: integer('id').primaryKey(),
  root: text('root', { mode: 'json' }).$type<SnapshotOutOfModel<store.RootStore>>(),
  createdAt: text('timestamp').default(sql`CURRENT_TIMESTAMP`)
})

export type RootStoreTable = typeof rootStore.$inferSelect // return type when queried
export type InsertRootStoreTable = typeof rootStore.$inferInsert // insert type
