import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const vouchTypeEnum = pgEnum('vouch_type', ['Discord', 'PoeAccount']);

export const poeProfiles = pgTable('poe_profiles', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 256 }),
  token: varchar('token', { length: 256 }),


  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    nameIndex: uniqueIndex('name_idx').on(table.name),
  }
});

export const poeAccounts = pgTable('poe_accounts', {
  id: varchar('id', { length: 75 }).primaryKey(),
  poeProfileId: varchar('poe_profile_id', { length: 60 }),

  name: varchar('name', { length: 256 }),
  realm: varchar('realm', { length: 60 }),
  class: varchar('class', { length: 60 }),
  league: varchar('league', { length: 60 }),
  level: integer('level'),
  experience: integer('experience'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const discordAccounts = pgTable('discord_accounts', {
  id: text('id').primaryKey(),
  poeAccountId: varchar('poe_account_id', { length: 100 }),
  name: varchar('name', { length: 60 }),
  tftVouchBonus: integer("tft_vouch_bonus"),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const vouches = pgTable('vouches', {
  id: varchar('id', { length: 256 }).primaryKey(),
  timestamp: timestamp('timestamp').defaultNow(),
  sourceType: vouchTypeEnum("source_type"),
  sourceId: varchar('source_id', { length: 60 }),
  targetType: vouchTypeEnum("target_type"),
  targetId: varchar('target_id', { length: 60 }),
  vouchType: varchar('vouch_type', { length: 60 }),
  vouchValue: integer('vouch_value'),
});

export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 60 }).primaryKey(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  type: varchar("type", { length: 60 }).notNull(),
  targetId: varchar('target_id', { length: 60 }).notNull(),
  senderId: varchar('sender_id', { length: 60 }),
  body: text('body').notNull(),
});

export const violationTargetTypeEnum = pgEnum('violation_target_type', ['Discord', 'PoeAccount']);

export const violations = pgTable('violations', {
  id: varchar('id', { length: 256 }).primaryKey(),
  timestamp: timestamp('timestamp').defaultNow(),
  targetType: violationTargetTypeEnum("target_type"),
  targetId: varchar('target_id', { length: 60 }),
  violationDesc: varchar('violation_desc', { length: 400 }),
  violationType: varchar('violation_type', { length: 60 }),
  vouchValue: integer('violation_value'),
});

export const listings = pgTable('listings', {
  key: varchar('key', { length: 128 }).primaryKey(),
  uuid: varchar('id', { length: 60 }).notNull(),
  userId: varchar('user_id', { length: 60 }).notNull(),
  league: varchar('league', { length: 30 }).notNull(),
  category: varchar('category', { length: 30 }).notNull(),
  subCategory: varchar('sub_category', { length: 30 }).notNull(),
  ign: varchar('ign', { length: 55 }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  listingMode: varchar('listing_mode', { length: 25 }).notNull(),
  tabs: text('tabs').notNull(),
  items: text('items').notNull(),
  deleted: boolean("deleted").notNull()
});


