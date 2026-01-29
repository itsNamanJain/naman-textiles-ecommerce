import { relations } from "drizzle-orm";
import { index, numeric, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { products, productVariants } from "./inventory";
import { createTable } from "./table-creator";

// ==================== CART TABLE ====================

export const carts = createTable(
  "cart",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionId: varchar("session_id", { length: 255 }), // For guest carts
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => [
    index("cart_user_id_idx").on(t.userId),
    index("cart_session_id_idx").on(t.sessionId),
  ]
);

// ==================== CART ITEMS TABLE ====================

export const cartItems = createTable(
  "cart_item",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    cartId: varchar("cart_id", { length: 255 })
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: varchar("variant_id", { length: 255 }).references(
      () => productVariants.id,
      { onDelete: "set null" }
    ),
    quantity: numeric("quantity", { precision: 10, scale: 2 })
      .default("1")
      .notNull(), // Supports decimal for meters
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => [
    index("cart_item_cart_id_idx").on(t.cartId),
    index("cart_item_product_id_idx").on(t.productId),
  ]
);

// ==================== WISHLIST TABLE ====================

export const wishlists = createTable(
  "wishlist",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => [index("wishlist_user_id_idx").on(t.userId)]
);

// ==================== WISHLIST ITEMS TABLE ====================

export const wishlistItems = createTable(
  "wishlist_item",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    wishlistId: varchar("wishlist_id", { length: 255 })
      .notNull()
      .references(() => wishlists.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index("wishlist_item_wishlist_id_idx").on(t.wishlistId),
    index("wishlist_item_product_id_idx").on(t.productId),
  ]
);

// ==================== RELATIONS ====================

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlist = typeof wishlists.$inferInsert;

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type NewWishlistItem = typeof wishlistItems.$inferInsert;
