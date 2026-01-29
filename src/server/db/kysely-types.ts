import type { Generated } from "kysely";

import type * as schema from "./schema";

// ==================== UTILITY TYPES ====================
// Convert Drizzle types to Kysely-compatible types with Generated markers

type DrizzleSelect<T> = T extends { $inferSelect: infer S } ? S : never;
type DrizzleInsert<T> = T extends { $inferInsert: infer I } ? I : never;

// Marks fields that are optional in insert (have defaults) as Generated<T>
type ToKyselyTable<T> = {
  [K in keyof DrizzleSelect<T>]: K extends keyof DrizzleInsert<T>
    ? undefined extends DrizzleInsert<T>[K]
      ? Generated<DrizzleSelect<T>[K]>
      : DrizzleSelect<T>[K]
    : Generated<DrizzleSelect<T>[K]>;
};

// ==================== DATABASE INTERFACE ====================
// Types derived directly from Drizzle schema

export interface Database {
  // Users & Auth
  user: ToKyselyTable<typeof schema.users>;
  account: ToKyselyTable<typeof schema.accounts>;
  session: ToKyselyTable<typeof schema.sessions>;
  verificationToken: ToKyselyTable<typeof schema.verificationTokens>;
  address: ToKyselyTable<typeof schema.addresses>;

  // Inventory
  category: ToKyselyTable<typeof schema.categories>;
  product: ToKyselyTable<typeof schema.products>;
  productImage: ToKyselyTable<typeof schema.productImages>;
  productVariant: ToKyselyTable<typeof schema.productVariants>;

  // Cart & Wishlist
  cart: ToKyselyTable<typeof schema.carts>;
  cartItem: ToKyselyTable<typeof schema.cartItems>;
  wishlist: ToKyselyTable<typeof schema.wishlists>;
  wishlistItem: ToKyselyTable<typeof schema.wishlistItems>;

  // Orders
  order: ToKyselyTable<typeof schema.orders>;
  orderItem: ToKyselyTable<typeof schema.orderItems>;

  // Reviews
  review: ToKyselyTable<typeof schema.reviews>;

  // Marketing
  coupon: ToKyselyTable<typeof schema.coupons>;
  banner: ToKyselyTable<typeof schema.banners>;

  // Settings
  setting: ToKyselyTable<typeof schema.settings>;
}
