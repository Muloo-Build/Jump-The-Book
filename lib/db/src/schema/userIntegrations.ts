import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { appUsersTable } from "./userLibrary";

export const userIntegrationsTable = pgTable(
  "user_integrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => appUsersTable.userId, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    encryptedToken: text("encrypted_token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("user_integrations_user_idx").on(t.userId),
    providerUniq: uniqueIndex("user_integrations_provider_uniq").on(
      t.userId,
      t.provider,
    ),
  }),
);

export type UserIntegrationRow = typeof userIntegrationsTable.$inferSelect;
