import {
  boolean,
  index,
  integer,
  numeric,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { discountTypeEnum } from "./enums";
import { createTable } from "./table-creator";

export const coupons = createTable(
  "coupon",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
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
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  },
  (t) => [
    index("coupon_code_idx").on(t.code),
    index("coupon_is_active_idx").on(t.isActive),
  ]
);

export const banners = createTable(
  "banner",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 500 }),
    image: varchar("image", { length: 500 }).notNull(),
    link: varchar("link", { length: 500 }),
    position: integer("position").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  },
  (t) => [
    index("banner_is_active_idx").on(t.isActive),
    index("banner_position_idx").on(t.position),
  ]
);

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;

export type Banner = typeof banners.$inferSelect;
export type NewBanner = typeof banners.$inferInsert;
