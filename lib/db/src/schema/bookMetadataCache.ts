import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const bookMetadataCacheTable = pgTable(
  "book_metadata_cache",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: text("source").notNull(),
    externalId: text("external_id").notNull(),
    title: text("title").notNull(),
    author: text("author").notNull(),
    isbn: text("isbn"),
    description: text("description"),
    coverUrl: text("cover_url"),
    payload: jsonb("payload").notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    sourceExternalUniq: uniqueIndex("book_metadata_cache_source_external_uniq").on(
      t.source,
      t.externalId,
    ),
    titleAuthorIdx: index("book_metadata_cache_title_author_idx").on(
      t.title,
      t.author,
    ),
  }),
);

export type BookMetadataCacheRow = typeof bookMetadataCacheTable.$inferSelect;
