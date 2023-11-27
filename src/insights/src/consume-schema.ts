import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const listings = sqliteTable('listings', {
  id: text('id').primaryKey(),
  itemGroupHashString: text('itemGroupHashString'),
  shard: text('shard'),
  listedAtTimestamp: integer('listedAtTimestamp'),
  value: text('value'),
  valueType: text('valueType'),
  quantity: integer('quantity')
})
