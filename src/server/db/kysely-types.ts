import type { Kyselify } from "drizzle-orm/kysely";

import * as schema from "./schema";

// ==================== CAMEL CASE CONVERSION TYPES ====================
// These handle the CamelCasePlugin transformation

type ToCamel<S extends string | number | symbol> = S extends string
  ? S extends `${infer Head}_${infer Tail}`
    ? `${ToCamel<Uncapitalize<Head>>}${Capitalize<ToCamel<Tail>>}`
    : S extends `${infer Head}-${infer Tail}`
      ? `${ToCamel<Uncapitalize<Head>>}${Capitalize<ToCamel<Tail>>}`
      : Uncapitalize<S>
  : never;

type ObjectToCamel<T extends object | undefined | null> = T extends undefined
  ? undefined
  : T extends null
    ? null
    : T extends Array<infer ArrayType>
      ? Array<ArrayType>
      : T extends Uint8Array
        ? Uint8Array
        : T extends Date
          ? Date
          : {
              [K in keyof T as ToCamel<K>]: T[K];
            };

// ==================== DATABASE INTERFACE ====================
// Auto-generated from Drizzle schema using Kyselify

export interface Database {
  // Users & Auth
  user: ObjectToCamel<Kyselify<typeof schema.users>>;
  account: ObjectToCamel<Kyselify<typeof schema.accounts>>;
  session: ObjectToCamel<Kyselify<typeof schema.sessions>>;
  verificationToken: ObjectToCamel<Kyselify<typeof schema.verificationTokens>>;
  address: ObjectToCamel<Kyselify<typeof schema.addresses>>;

  // Inventory
  category: ObjectToCamel<Kyselify<typeof schema.categories>>;
  product: ObjectToCamel<Kyselify<typeof schema.products>>;
  productVariant: ObjectToCamel<Kyselify<typeof schema.productVariants>>;

  // Cart & Wishlist
  cart: ObjectToCamel<Kyselify<typeof schema.carts>>;
  cartItem: ObjectToCamel<Kyselify<typeof schema.cartItems>>;
  wishlist: ObjectToCamel<Kyselify<typeof schema.wishlists>>;
  wishlistItem: ObjectToCamel<Kyselify<typeof schema.wishlistItems>>;

  // Orders
  order: ObjectToCamel<Kyselify<typeof schema.orders>>;
  orderItem: ObjectToCamel<Kyselify<typeof schema.orderItems>>;

  // Reviews
  review: ObjectToCamel<Kyselify<typeof schema.reviews>>;

  // Marketing
  coupon: ObjectToCamel<Kyselify<typeof schema.coupons>>;
  banner: ObjectToCamel<Kyselify<typeof schema.banners>>;

  // Settings
  setting: ObjectToCamel<Kyselify<typeof schema.settings>>;
}
