import {
  boolean,
  index,
  integer,
  numeric,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
// Newsletter table removed - feature not needed
import { discountTypeEnum } from "./enums";
import { createTable } from "./table-creator";

// ==================== COUPON TABLE ====================

export const coupons = createTable(
  "coupon",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: varchar("code", { length: 100 }).notNull().unique(),
    description: text("description"),
    discountType: discountTypeEnum("discount_type").notNull(),
    discountValue: numeric("discount_value", {
      precision: 10,
      scale: 2,
    }).notNull(),
    minPurchase: numeric("min_purchase", { precision: 10, scale: 2 }),
    maxDiscount: numeric("max_discount", { precision: 10, scale: 2 }),
    usageLimit: integer("usage_limit"),
    usageCount: integer("usage_count").default(0).notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => [
    index("coupon_code_idx").on(t.code),
    index("coupon_is_active_idx").on(t.isActive),
  ]
);

// ==================== BANNER TABLE ====================

export const banners = createTable(
  "banner",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 500 }),
    image: varchar("image", { length: 500 }).notNull(),
    link: varchar("link", { length: 500 }),
    position: integer("position").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => [
    index("banner_is_active_idx").on(t.isActive),
    index("banner_position_idx").on(t.position),
  ]
);

// ==================== TYPE EXPORTS ====================

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;

export type Banner = typeof banners.$inferSelect;
export type NewBanner = typeof banners.$inferInsert;
