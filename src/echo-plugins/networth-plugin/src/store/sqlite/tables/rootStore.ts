import { sql } from 'drizzle-orm'
import { text, sqliteTable } from 'drizzle-orm/sqlite-core'
import { RootStore } from '../../rootStore'
import { SnapshotOutOfModel } from 'mobx-keystone'

// Save all data in one key/value
export const rootStore = sqliteTable('rootStore', {
  id: text('id').default('root'),
  root: text('root', { mode: 'json' }).$type<SnapshotOutOfModel<RootStore>>()
})
