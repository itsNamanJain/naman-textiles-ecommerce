import { pgEnum } from "drizzle-orm/pg-core";

// ==================== ENUMS ====================

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed",
]);

export const sellingModeEnum = pgEnum("selling_mode", [
  "meter", // Sold by meter (fabric rolls)
  "piece", // Sold by piece (ready items, accessories)
]);

export const unitEnum = pgEnum("unit", ["meter", "piece", "kg", "yard", "set"]);
