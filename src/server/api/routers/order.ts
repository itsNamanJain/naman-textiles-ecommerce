import { z } from "zod";
import { sql } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { generateOrderNumber } from "@/lib/utils";
import { DEFAULT_SETTINGS } from "@/lib/constants";

const shippingAddressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode required"),
});

const orderItemSchema = z.object({
  productId: z.string(),
  productName: z.string().optional(),
  productSku: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number(),
  unit: z.string(),
});

export const orderRouter = createTRPCRouter({
  // Create a new order (requires authentication)
  create: protectedProcedure
    .input(
      z.object({
        items: z.array(orderItemSchema).min(1, "At least one item required"),
        shippingAddress: shippingAddressSchema,
        paymentMethod: z.enum(["cod", "online"]).default("cod"),
        customerNote: z.string().optional(),
        couponCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Load store settings (fallback to defaults)
      const allSettings = await ctx.db
        .selectFrom("setting")
        .select(["key", "value"])
        .execute();
      const settingsMap: Record<string, string> = {};
      allSettings.forEach((setting) => {
        settingsMap[setting.key] = setting.value;
      });
      const freeShippingThreshold = Number(
        settingsMap.shippingFreeThreshold ??
          DEFAULT_SETTINGS.shippingFreeThreshold
      );
      const shippingRate = Number(
        settingsMap.shippingBaseRate ?? DEFAULT_SETTINGS.shippingBaseRate
      );
      const minOrderAmount = Number(
        settingsMap.orderMinAmount ?? DEFAULT_SETTINGS.orderMinAmount
      );

      // Get product IDs from items
      const productIds = input.items.map((item) => item.productId);

      // Fetch current stock for all products
      const productStock = await ctx.db
        .selectFrom("product")
        .select([
          "id",
          "name",
          "stockQuantity",
          "price",
          "sku",
          "unit",
          "minOrderQuantity",
          "maxOrderQuantity",
          "trackQuantity",
          "allowBackorder",
        ])
        .where("id", "in", productIds)
        .execute();

      // Create a map for quick lookup
      const stockMap = new Map(
        productStock.map((p) => [
          p.id,
          {
            name: p.name,
            stock: Number(p.stockQuantity),
            price: Number(p.price),
            sku: p.sku ?? null,
            unit: p.unit,
            minOrderQuantity: Number(p.minOrderQuantity),
            maxOrderQuantity: p.maxOrderQuantity
              ? Number(p.maxOrderQuantity)
              : null,
            trackQuantity: p.trackQuantity,
            allowBackorder: p.allowBackorder,
          },
        ])
      );

      // Check stock availability for all items
      const outOfStockItems: string[] = [];
      const invalidItems: string[] = [];
      const normalizedItems = input.items.map((item) => {
        const productInfo = stockMap.get(item.productId);
        if (!productInfo) {
          invalidItems.push(item.productId);
          return null;
        }

        const quantity = item.quantity;
        if (quantity <= 0) {
          invalidItems.push(productInfo.name);
          return null;
        }

        if (quantity < productInfo.minOrderQuantity) {
          invalidItems.push(
            `${productInfo.name} (min: ${productInfo.minOrderQuantity})`
          );
          return null;
        }

        if (
          productInfo.maxOrderQuantity !== null &&
          quantity > productInfo.maxOrderQuantity
        ) {
          invalidItems.push(
            `${productInfo.name} (max: ${productInfo.maxOrderQuantity})`
          );
          return null;
        }

        const unitPrice = productInfo.price;
        const stock = productInfo.stock;

        if (productInfo.trackQuantity && !productInfo.allowBackorder) {
          if (stock < quantity) {
            outOfStockItems.push(
              `${productInfo.name} (requested: ${quantity}, available: ${stock})`
            );
          }
        }

        return {
          productId: item.productId,
          productName: productInfo.name,
          productSku: productInfo.sku,
          unitPrice,
          quantity,
          unit: productInfo.unit,
          trackQuantity: productInfo.trackQuantity,
        };
      });

      if (invalidItems.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid items: ${invalidItems.join(", ")}`,
        });
      }

      if (outOfStockItems.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient stock for: ${outOfStockItems.join(", ")}`,
        });
      }

      // Calculate totals
      const validItems = normalizedItems.filter(Boolean) as NonNullable<
        (typeof normalizedItems)[number]
      >[];
      const subtotal = validItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      if (subtotal < minOrderAmount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Minimum order amount is ₹${minOrderAmount}`,
        });
      }

      const shippingCost = subtotal >= freeShippingThreshold ? 0 : shippingRate;

      let discount = 0;
      let appliedCouponCode: string | null = null;
      if (input.couponCode) {
        const normalizedCode = input.couponCode
          .toUpperCase()
          .replace(/\s/g, "");
        const now = new Date();
        const coupon = await ctx.db
          .selectFrom("coupon")
          .selectAll()
          .where("code", "=", normalizedCode)
          .where("isActive", "=", true)
          .where("startDate", "<=", now)
          .where("endDate", ">=", now)
          .executeTakeFirst();

        if (!coupon) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired coupon code",
          });
        }

        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This coupon has reached its usage limit",
          });
        }

        const minPurchase = Number(coupon.minPurchase ?? 0);
        if (subtotal < minPurchase) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Minimum purchase of ₹${minPurchase} required for this coupon`,
          });
        }

        const discountValue = Number(coupon.discountValue);
        if (coupon.discountType === "percentage") {
          discount = (subtotal * discountValue) / 100;
          const maxDiscount = Number(coupon.maxDiscount ?? 0);
          if (maxDiscount > 0 && discount > maxDiscount) {
            discount = maxDiscount;
          }
        } else {
          discount = discountValue;
        }

        if (discount > subtotal) {
          discount = subtotal;
        }

        discount = Math.round(discount * 100) / 100;
        appliedCouponCode = coupon.code;
      }

      const total = subtotal + shippingCost - discount;

      // Create order with embedded shipping address
      const order = await ctx.db
        .insertInto("order")
        .values({
          orderNumber: generateOrderNumber(),
          userId: userId,
          status: "pending",
          paymentStatus: "pending",
          paymentMethod: input.paymentMethod,
          subtotal: subtotal.toString(),
          shippingCost: shippingCost.toString(),
          discount: discount.toString(),
          couponDiscount: discount.toString(),
          total: total.toString(),
          couponCode: appliedCouponCode,
          shippingName: input.shippingAddress.name,
          shippingPhone: input.shippingAddress.phone,
          shippingAddressLine1: input.shippingAddress.addressLine1,
          shippingAddressLine2: input.shippingAddress.addressLine2 ?? null,
          shippingCity: input.shippingAddress.city,
          shippingState: input.shippingAddress.state,
          shippingPincode: input.shippingAddress.pincode,
          customerNote: input.customerNote ?? null,
        })
        .returningAll()
        .executeTakeFirst();

      if (!order) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create order",
        });
      }

      // Create order items and deduct stock
      for (const item of validItems) {
        await ctx.db
          .insertInto("orderItem")
          .values({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku ?? null,
            price: item.unitPrice.toFixed(2),
            quantity: item.quantity.toFixed(2),
            unit: item.unit,
            total: (item.unitPrice * item.quantity).toFixed(2),
          })
          .execute();

        if (item.trackQuantity) {
          const currentStock = stockMap.get(item.productId)?.stock ?? 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          await ctx.db
            .updateTable("product")
            .set({ stockQuantity: newStock.toString() })
            .where("id", "=", item.productId)
            .execute();
        }
      }

      if (appliedCouponCode) {
        await ctx.db
          .updateTable("coupon")
          .set({ usageCount: sql`"usage_count" + 1` })
          .where("code", "=", appliedCouponCode)
          .execute();
      }

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        totals: {
          subtotal,
          shippingCost,
          discount,
          total,
        },
        couponCode: appliedCouponCode,
      };
    }),

  // Get order by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const isAdmin = ctx.session.user.role === "admin";

      let query = ctx.db
        .selectFrom("order")
        .selectAll("order")
        .select((eb) => [
          jsonArrayFrom(
            eb
              .selectFrom("orderItem")
              .selectAll()
              .whereRef("orderItem.orderId", "=", "order.id")
          ).as("items"),
          jsonObjectFrom(
            eb
              .selectFrom("user")
              .select(["id", "name", "email"])
              .whereRef("user.id", "=", "order.userId")
          ).as("user"),
        ])
        .where("order.id", "=", input.id);

      if (!isAdmin) {
        query = query.where("order.userId", "=", userId);
      }

      const order = await query.executeTakeFirst();

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return order;
    }),

  // Get order by order number (for tracking - public but limited info)
  getByOrderNumber: publicProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db
        .selectFrom("order")
        .select([
          "id",
          "orderNumber",
          "status",
          "paymentStatus",
          "total",
          "shippingCity",
          "shippingState",
          "trackingNumber",
          "shippedAt",
          "deliveredAt",
          "createdAt",
        ])
        .select((eb) => [
          jsonArrayFrom(
            eb
              .selectFrom("orderItem")
              .select(["productName", "quantity", "total"])
              .whereRef("orderItem.orderId", "=", "order.id")
          ).as("items"),
        ])
        .where("orderNumber", "=", input.orderNumber)
        .executeTakeFirst();

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return order;
    }),

  // Get user's orders (requires auth)
  getUserOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const userId = ctx.session.user.id;

      let query = ctx.db
        .selectFrom("order")
        .selectAll("order")
        .select((eb) => [
          jsonArrayFrom(
            eb
              .selectFrom("orderItem")
              .selectAll()
              .whereRef("orderItem.orderId", "=", "order.id")
          ).as("items"),
        ])
        .where("order.userId", "=", userId)
        .orderBy("order.createdAt", "desc");

      if (cursor) {
        query = query.where("order.id", ">", cursor);
      }

      const userOrders = await query.limit(limit + 1).execute();

      let nextCursor: string | undefined;
      if (userOrders.length > limit) {
        const nextItem = userOrders.pop();
        nextCursor = nextItem?.id;
      }

      return {
        orders: userOrders,
        nextCursor,
      };
    }),

  // Cancel order (user can cancel pending orders)
  cancel: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const order = await ctx.db
        .selectFrom("order")
        .selectAll("order")
        .select((eb) => [
          jsonArrayFrom(
            eb
              .selectFrom("orderItem")
              .selectAll()
              .whereRef("orderItem.orderId", "=", "order.id")
          ).as("items"),
        ])
        .where("order.id", "=", input.orderId)
        .where("order.userId", "=", userId)
        .executeTakeFirst();

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      if (order.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only pending orders can be cancelled",
        });
      }

      // Restore stock for each item
      for (const item of order.items ?? []) {
        const product = await ctx.db
          .selectFrom("product")
          .select(["stockQuantity"])
          .where("id", "=", item.productId)
          .executeTakeFirst();

        if (product) {
          const currentStock = Number(product.stockQuantity);
          const restoredStock = currentStock + Number(item.quantity);
          await ctx.db
            .updateTable("product")
            .set({ stockQuantity: restoredStock.toString() })
            .where("id", "=", item.productId)
            .execute();
        }
      }

      await ctx.db
        .updateTable("order")
        .set({ status: "cancelled" })
        .where("id", "=", input.orderId)
        .execute();

      return { success: true };
    }),

  // Get order count for user
  getCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const result = await ctx.db
      .selectFrom("order")
      .select(sql<number>`count(*)`.as("count"))
      .where("userId", "=", userId)
      .executeTakeFirst();

    return result?.count ?? 0;
  }),
});
