import { relations } from "drizzle-orm";
import { index, numeric, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { orderStatusEnum, paymentStatusEnum } from "./enums";
import { users } from "./users";
import { products } from "./inventory";
import { createTable } from "./table-creator";

// ==================== ORDER TABLE ====================

export const orders = createTable(
  "order",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),

    // Pricing
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    tax: numeric("tax", { precision: 10, scale: 2 }).default("0").notNull(),
    shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),

    // Status
    status: orderStatusEnum("status").default("pending").notNull(),
    paymentStatus: paymentStatusEnum("payment_status")
      .default("pending")
      .notNull(),
    paymentMethod: varchar("payment_method", { length: 100 }),
    paymentId: varchar("payment_id", { length: 255 }),

    // Shipping address (snapshot at time of order)
    shippingName: varchar("shipping_name", { length: 255 }).notNull(),
    shippingPhone: varchar("shipping_phone", { length: 20 }).notNull(),
    shippingAddressLine1: varchar("shipping_address_line_1", {
      length: 500,
    }).notNull(),
    shippingAddressLine2: varchar("shipping_address_line_2", { length: 500 }),
    shippingCity: varchar("shipping_city", { length: 100 }).notNull(),
    shippingState: varchar("shipping_state", { length: 100 }).notNull(),
    shippingPincode: varchar("shipping_pincode", { length: 10 }).notNull(),
    gstNumber: varchar("gst_number", { length: 15 }),

    // Tracking
    trackingNumber: varchar("tracking_number", { length: 255 }),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),

    // Notes
    customerNote: text("customer_note"),
    adminNote: text("admin_note"),

    // Coupon
    couponCode: varchar("coupon_code", { length: 100 }),
    couponDiscount: numeric("coupon_discount", { precision: 10, scale: 2 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => [
    index("order_user_id_idx").on(t.userId),
    index("order_order_number_idx").on(t.orderNumber),
    index("order_status_idx").on(t.status),
    index("order_payment_status_idx").on(t.paymentStatus),
    index("order_created_at_idx").on(t.createdAt),
  ]
);

export const orderItems = createTable(
  "order_item",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: varchar("order_id", { length: 255 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id),
    variantId: varchar("variant_id", { length: 255 }),

    // Snapshot of product at time of order
    productName: varchar("product_name", { length: 255 }).notNull(),
    productSku: varchar("product_sku", { length: 100 }),
    variantName: varchar("variant_name", { length: 255 }),

    // Pricing & quantity
    price: numeric("price", { precision: 10, scale: 2 }).notNull(), // Price per unit
    quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(), // Supports decimal for meters
    unit: varchar("unit", { length: 50 }).notNull(), // meter, piece, etc.
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index("order_item_order_id_idx").on(t.orderId),
    index("order_item_product_id_idx").on(t.productId),
  ]
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
