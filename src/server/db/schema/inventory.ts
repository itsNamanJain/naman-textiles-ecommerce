import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { sellingModeEnum } from "./enums";
import { createTable } from "./table-creator";

export const categories = createTable(
  "category",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => [index("category_slug_idx").on(t.slug)]
);

export const products = createTable(
  "product",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    comparePrice: numeric("compare_price", { precision: 10, scale: 2 }),
    sellingMode: sellingModeEnum("selling_mode").default("meter").notNull(),
    minOrderQuantity: numeric("min_order_quantity", { precision: 10, scale: 2 })
      .default("1")
      .notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    categoryId: varchar("category_id", { length: 255 })
      .notNull()
      .references(() => categories.id),

    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => [
    index("product_slug_idx").on(t.slug),
    index("product_category_id_idx").on(t.categoryId),
    index("product_is_active_idx").on(t.isActive),
    index("product_is_featured_idx").on(t.isFeatured),
    index("product_name_idx").on(t.name),
    index("product_selling_mode_idx").on(t.sellingMode),
  ]
);

export const productImages = createTable(
  "product_image",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: varchar("url", { length: 500 }).notNull(),
    publicId: varchar("public_id", { length: 255 }),
    alt: varchar("alt", { length: 255 }),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [index("product_image_product_id_idx").on(t.productId)]
);

export const productVariants = createTable(
  "product_variant",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),

    size: varchar("size", { length: 50 }),
    length: varchar("length", { length: 50 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => [index("product_variant_product_id_idx").on(t.productId)]
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
