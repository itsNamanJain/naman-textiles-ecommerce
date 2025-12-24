import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./inventory";
import { createTable } from "./table-creator";

// ==================== REVIEW TABLE ====================

export const reviews = createTable(
  "review",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1-5
    title: varchar("title", { length: 255 }),
    comment: text("comment"),
    isVerified: boolean("is_verified").default(false).notNull(), // Verified purchase
    isApproved: boolean("is_approved").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => [
    index("review_user_id_idx").on(t.userId),
    index("review_product_id_idx").on(t.productId),
    index("review_is_approved_idx").on(t.isApproved),
    index("review_rating_idx").on(t.rating),
  ]
);

// ==================== RELATIONS ====================

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

// ==================== TYPE EXPORTS ====================

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
