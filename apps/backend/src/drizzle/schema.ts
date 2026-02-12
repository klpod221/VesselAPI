import { pgTable, text, timestamp, boolean, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('User', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const collections = pgTable('Collection', {
  id: text('id').primaryKey(), // Client-generated UUID
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  version: text('version').notNull(),
  content: json('content').notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  syncedAt: timestamp('syncedAt').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  collections: many(collections),
}));

export const collectionsRelations = relations(collections, ({ one }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
}));
