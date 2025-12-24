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
import { sellingModeEnum, unitEnum } from "./enums";
import { createTable } from "./table-creator";

// ==================== CATEGORY TABLE ====================

export const categories = createTable(
  "category",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    image: varchar("image", { length: 500 }),
    parentId: varchar("parent_id", { length: 255 }),
    position: integer("position").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => [
    index("category_slug_idx").on(t.slug),
    index("category_parent_id_idx").on(t.parentId),
  ]
);

// ==================== PRODUCT TABLE ====================

export const products = createTable(
  "product",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    shortDescription: varchar("short_description", { length: 500 }),

    // Pricing & Selling Mode
    price: numeric("price", { precision: 10, scale: 2 }).notNull(), // Price per unit
    comparePrice: numeric("compare_price", { precision: 10, scale: 2 }),
    costPrice: numeric("cost_price", { precision: 10, scale: 2 }),

    // Selling configuration
    sellingMode: sellingModeEnum("selling_mode").default("meter").notNull(), // meter or piece
    unit: unitEnum("unit").default("meter").notNull(), // Display unit
    minOrderQuantity: numeric("min_order_quantity", { precision: 10, scale: 2 })
      .default("1")
      .notNull(), // Minimum order qty (e.g., 0.5 for half meter)
    quantityStep: numeric("quantity_step", { precision: 10, scale: 2 })
      .default("0.5")
      .notNull(), // Increment step (e.g., 0.5m, 1m)
    maxOrderQuantity: numeric("max_order_quantity", {
      precision: 10,
      scale: 2,
    }), // Max per order (optional)

    // Identifiers
    sku: varchar("sku", { length: 100 }).unique(),
    barcode: varchar("barcode", { length: 100 }),

    // Fabric specific fields
    fabricType: varchar("fabric_type", { length: 100 }),
    material: varchar("material", { length: 255 }),
    width: varchar("width", { length: 50 }), // e.g., "44 inches", "58 inches"
    weight: varchar("weight", { length: 50 }), // e.g., "150 GSM"
    color: varchar("color", { length: 100 }),
    pattern: varchar("pattern", { length: 100 }),
    composition: varchar("composition", { length: 255 }), // e.g., "100% Cotton"

    // Stock management (stored in base unit)
    stockQuantity: numeric("stock_quantity", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    lowStockThreshold: numeric("low_stock_threshold", {
      precision: 10,
      scale: 2,
    })
      .default("10")
      .notNull(),
    trackQuantity: boolean("track_quantity").default(true).notNull(),
    allowBackorder: boolean("allow_backorder").default(false).notNull(),

    // Status
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),

    // SEO
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),

    // Category
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

// ==================== PRODUCT IMAGES TABLE ====================

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
    alt: varchar("alt", { length: 255 }),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [index("product_image_product_id_idx").on(t.productId)]
);

// ==================== PRODUCT VARIANTS TABLE ====================

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
    sku: varchar("sku", { length: 100 }).unique(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    stockQuantity: numeric("stock_quantity", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),

    // Variant attributes
    size: varchar("size", { length: 50 }),
    color: varchar("color", { length: 100 }),
    length: varchar("length", { length: 50 }), // For pre-cut fabric lengths

    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => [index("product_variant_product_id_idx").on(t.productId)]
);

// ==================== RELATIONS ====================

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryParent",
  }),
  children: many(categories, { relationName: "categoryParent" }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
  })
);

// ==================== TYPE EXPORTS ====================

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
