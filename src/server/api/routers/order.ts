import { z } from "zod";
import { eq, desc, and, sql, inArray, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { orders, orderItems, products, coupons } from "@/server/db/schema";
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
      const allSettings = await ctx.db.query.settings.findMany();
      const settingsMap: Record<string, string> = {};
      allSettings.forEach((setting) => {
        settingsMap[setting.key] = setting.value;
      });
      const freeShippingThreshold = Number(
        settingsMap.shippingFreeThreshold ?? DEFAULT_SETTINGS.shippingFreeThreshold
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
      const productStock = await ctx.db.query.products.findMany({
        where: inArray(products.id, productIds),
        columns: {
          id: true,
          name: true,
          stockQuantity: true,
          price: true,
          sku: true,
          unit: true,
          minOrderQuantity: true,
          maxOrderQuantity: true,
          trackQuantity: true,
          allowBackorder: true,
        },
      });

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
            maxOrderQuantity: p.maxOrderQuantity ? Number(p.maxOrderQuantity) : null,
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

      for (const item of input.items) {
        // Keep existing loop for legacy behavior safety (now validated in normalizedItems)
        const productInfo = stockMap.get(item.productId);
        if (!productInfo) continue;
      }

      if (outOfStockItems.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient stock for: ${outOfStockItems.join(", ")}`,
        });
      }

      // Calculate totals
      const validItems = normalizedItems.filter(Boolean) as NonNullable<
        typeof normalizedItems[number]
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
        const normalizedCode = input.couponCode.toUpperCase().replace(/\s/g, "");
        const now = new Date();
        const coupon = await ctx.db.query.coupons.findFirst({
          where: and(
            eq(coupons.code, normalizedCode),
            eq(coupons.isActive, true),
            lte(coupons.startDate, now),
            gte(coupons.endDate, now)
          ),
        });

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
      const [order] = await ctx.db
        .insert(orders)
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
          // Embedded shipping address
          shippingName: input.shippingAddress.name,
          shippingPhone: input.shippingAddress.phone,
          shippingAddressLine1: input.shippingAddress.addressLine1,
          shippingAddressLine2: input.shippingAddress.addressLine2 ?? null,
          shippingCity: input.shippingAddress.city,
          shippingState: input.shippingAddress.state,
          shippingPincode: input.shippingAddress.pincode,
          customerNote: input.customerNote ?? null,
        })
        .returning();

      if (!order) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create order",
        });
      }

      // Create order items and deduct stock
      for (const item of validItems) {
        const orderItemData = {
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku ?? null,
          price: item.unitPrice.toFixed(2),
          quantity: item.quantity.toFixed(2),
          unit: item.unit,
          total: (item.unitPrice * item.quantity).toFixed(2),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await ctx.db.insert(orderItems).values(orderItemData as any);

        // Deduct stock from product
        if (item.trackQuantity) {
          const currentStock = stockMap.get(item.productId)?.stock ?? 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          await ctx.db
            .update(products)
            .set({ stockQuantity: newStock.toString() })
            .where(eq(products.id, item.productId));

        }
      }

      if (appliedCouponCode) {
        await ctx.db
          .update(coupons)
          .set({ usageCount: sql`${coupons.usageCount} + 1` })
          .where(eq(coupons.code, appliedCouponCode));
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

      const order = await ctx.db.query.orders.findFirst({
        where: isAdmin
          ? eq(orders.id, input.id)
          : and(eq(orders.id, input.id), eq(orders.userId, userId)),
        with: {
          items: true,
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

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
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.orderNumber, input.orderNumber),
        columns: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          shippingCity: true,
          shippingState: true,
          trackingNumber: true,
          shippedAt: true,
          deliveredAt: true,
          createdAt: true,
        },
        with: {
          items: {
            columns: {
              productName: true,
              quantity: true,
              total: true,
            },
          },
        },
      });

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
      const { limit } = input;
      const userId = ctx.session.user.id;

      const userOrders = await ctx.db.query.orders.findMany({
        where: eq(orders.userId, userId),
        orderBy: [desc(orders.createdAt)],
        limit: limit + 1,
        with: {
          items: true,
        },
      });

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

      const order = await ctx.db.query.orders.findFirst({
        where: and(eq(orders.id, input.orderId), eq(orders.userId, userId)),
        with: {
          items: true,
        },
      });

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
      for (const item of order.items) {
        const product = await ctx.db.query.products.findFirst({
          where: eq(products.id, item.productId),
          columns: { stockQuantity: true },
        });

        if (product) {
          const currentStock = Number(product.stockQuantity);
          const restoredStock = currentStock + Number(item.quantity);
          await ctx.db
            .update(products)
            .set({ stockQuantity: restoredStock.toString() })
            .where(eq(products.id, item.productId));
        }
      }

      await ctx.db
        .update(orders)
        .set({ status: "cancelled" })
        .where(eq(orders.id, input.orderId));

      return { success: true };
    }),

  // Get order count for user
  getCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const result = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.userId, userId));

    return result[0]?.count ?? 0;
  }),
});
