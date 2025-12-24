import { z } from "zod";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { orders, orderItems, products } from "@/server/db/schema";
import { generateOrderNumber } from "@/lib/utils";

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
  variantId: z.string().optional(),
  productName: z.string(),
  productSku: z.string().optional(),
  variantName: z.string().optional(),
  price: z.number(),
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
        discount: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get product IDs from items
      const productIds = input.items.map((item) => item.productId);

      // Fetch current stock for all products
      const productStock = await ctx.db.query.products.findMany({
        where: inArray(products.id, productIds),
        columns: {
          id: true,
          name: true,
          stockQuantity: true,
        },
      });

      // Create a map for quick lookup
      const stockMap = new Map(
        productStock.map((p) => [
          p.id,
          { name: p.name, stock: Number(p.stockQuantity) },
        ])
      );

      // Check stock availability for all items
      const outOfStockItems: string[] = [];
      for (const item of input.items) {
        const productInfo = stockMap.get(item.productId);
        if (!productInfo) {
          outOfStockItems.push(item.productName);
          continue;
        }
        if (productInfo.stock < item.quantity) {
          outOfStockItems.push(
            `${item.productName} (requested: ${item.quantity}, available: ${productInfo.stock})`
          );
        }
      }

      if (outOfStockItems.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient stock for: ${outOfStockItems.join(", ")}`,
        });
      }

      // Calculate totals
      const subtotal = input.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shippingCost = subtotal > 999 ? 0 : 99;
      const discount = input.discount ?? 0;
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
          total: total.toString(),
          couponCode: input.couponCode ?? null,
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
      for (const item of input.items) {
        const orderItemData = {
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId ?? null,
          productName: item.productName,
          productSku: item.productSku ?? null,
          variantName: item.variantName ?? null,
          price: item.price.toFixed(2),
          quantity: item.quantity.toFixed(2),
          unit: item.unit,
          total: (item.price * item.quantity).toFixed(2),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await ctx.db.insert(orderItems).values(orderItemData as any);

        // Deduct stock from product
        const currentStock = stockMap.get(item.productId)?.stock ?? 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        await ctx.db
          .update(products)
          .set({ stockQuantity: newStock.toString() })
          .where(eq(products.id, item.productId));
      }

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
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
