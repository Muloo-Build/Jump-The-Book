import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { appUsersTable, userBooksTable } from "./userLibrary";

export const bookReviewsTable = pgTable(
  "book_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => appUsersTable.userId, { onDelete: "cascade" }),
    userBookId: uuid("user_book_id")
      .notNull()
      .references(() => userBooksTable.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    body: text("body"),
    containsSpoilers: boolean("contains_spoilers").notNull().default(false),
    shareToTrending: boolean("share_to_trending").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("book_reviews_user_idx").on(t.userId),
    bookIdx: index("book_reviews_book_idx").on(t.userBookId),
    userBookUniq: uniqueIndex("book_reviews_user_book_uniq").on(
      t.userId,
      t.userBookId,
    ),
  }),
);

export type BookReviewRow = typeof bookReviewsTable.$inferSelect;
