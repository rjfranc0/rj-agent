# Drizzle Schema

Expressing schema decisions in Drizzle (`drizzle-orm/pg-core`). Which type/constraint/index to use is decided at the Postgres layer — this is the syntax.

## Tables & columns

```typescript
import { pgTable, bigint, text, boolean, timestamp, numeric, jsonb, uniqueIndex, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  status: text('status').notNull().default('pending'),
  settings: jsonb('settings').$type<{ theme: 'light' | 'dark'; locale: string }>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('users_email_key').on(t.email),
  check('users_status_check', sql`${t.status} IN ('pending', 'active', 'disabled')`),
]);
```

Column ↔ decision mapping:

| Postgres decision | Drizzle |
|---|---|
| `BIGINT IDENTITY` PK | `bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity()` |
| UUID PK (v7 via DB function) | `uuid('id').primaryKey().default(sql`uuidv7()`)` — `.defaultRandom()` is v4 |
| `TIMESTAMPTZ` | `timestamp('...', { withTimezone: true })` — never omit the option |
| `NUMERIC(12,2)` | `numeric('price', { precision: 12, scale: 2 })` (string mode by default — keep it for money) |
| `TEXT + CHECK` enum | `text(...)` + `check(...)` in the table extras |
| Typed JSONB | `jsonb('...').$type<Shape>()` |
| Generated column | `.generatedAlwaysAs(sql`...`)` |

`bigint` mode: `'number'` is fine for IDs (safe to 2^53); `'bigint'` when values can genuinely exceed that.

## Foreign keys

```typescript
export const orders = pgTable('orders', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  userId: bigint('user_id', { mode: 'number' }).notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
}, (t) => [
  index('orders_user_id_idx').on(t.userId),   // FK index — always, never rely on Postgres
]);
```

`onDelete`/`onUpdate` always explicit. Self-reference needs `AnyPgColumn`:

```typescript
import { type AnyPgColumn } from 'drizzle-orm/pg-core';
parentId: bigint('parent_id', { mode: 'number' }).references((): AnyPgColumn => comments.id),
```

## Indexes

```typescript
(t) => [
  index('orders_status_created_idx').on(t.status, t.createdAt),          // composite — order per Layer 1
  index('orders_active_idx').on(t.userId).where(sql`${t.status} = 'active'`),  // partial
  index('events_data_idx').using('gin', t.data),                          // GIN for JSONB
  uniqueIndex('users_email_key').on(t.email).where(sql`${t.deletedAt} IS NULL`), // unique + soft-delete
]
```

## Relations

Relations are application-level metadata enabling the relational query API — they don't create FKs (`.references()` does).

```typescript
import { relations } from 'drizzle-orm';

// one-to-many
export const usersRelations = relations(users, ({ many }) => ({ orders: many(orders) }));
export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));
```

Many-to-many — junction table with composite PK, relations through it:

```typescript
import { primaryKey } from 'drizzle-orm/pg-core';

export const postTags = pgTable('post_tags', {
  postId: bigint('post_id', { mode: 'number' }).notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tagId: bigint('tag_id', { mode: 'number' }).notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (t) => [
  primaryKey({ columns: [t.postId, t.tagId] }),
  index('post_tags_tag_id_idx').on(t.tagId),  // PK covers (postId, tagId); reverse lookup needs this
]);

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagId], references: [tags.id] }),
}));
```

One-to-one: FK column gets `.unique()`, relation declared with `one` on both sides.

## Inferred types

```typescript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

Export these next to the table; downstream code never hand-writes row shapes.
