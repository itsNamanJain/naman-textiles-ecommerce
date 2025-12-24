import { text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createTable } from "./table-creator";

// ==================== SETTINGS TABLE ====================

export const settings = createTable("setting", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});

// ==================== TYPE EXPORTS ====================

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
