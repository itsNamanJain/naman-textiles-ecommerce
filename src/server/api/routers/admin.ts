import { z } from "zod";
import { eq, desc, sql, and, count, inArray, like, or, gte, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  adminProcedure,
} from "@/server/api/trpc";
import { orders, orderItems, products, users, categories, productImages, settings } from "@/server/db/schema";

// Helper function to calculate growth percentage
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

export const adminRouter = createTRPCRouter({
  // Get dashboard stats with growth metrics
  getStats: adminProcedure.query(async ({ ctx }) => {
    // Calculate date ranges
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Total revenue (all time)
    const revenueResult = await ctx.db
      .select({ total: sql<string>`COALESCE(SUM(${orders.total}), 0)` })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"));
    const totalRevenue = Number(revenueResult[0]?.total ?? 0);

    // Current month revenue
    const currentMonthRevenueResult = await ctx.db
      .select({ total: sql<string>`COALESCE(SUM(${orders.total}), 0)` })
      .from(orders)
      .where(
        and(
          eq(orders.paymentStatus, "paid"),
          gte(orders.createdAt, currentMonthStart)
        )
      );
    const currentMonthRevenue = Number(currentMonthRevenueResult[0]?.total ?? 0);

    // Last month revenue
    const lastMonthRevenueResult = await ctx.db
      .select({ total: sql<string>`COALESCE(SUM(${orders.total}), 0)` })
      .from(orders)
      .where(
        and(
          eq(orders.paymentStatus, "paid"),
          gte(orders.createdAt, lastMonthStart),
          lt(orders.createdAt, currentMonthStart)
        )
      );
    const lastMonthRevenue = Number(lastMonthRevenueResult[0]?.total ?? 0);

    // Total orders (all time)
    const ordersResult = await ctx.db
      .select({ count: count() })
      .from(orders);
    const totalOrders = ordersResult[0]?.count ?? 0;

    // Current month orders
    const currentMonthOrdersResult = await ctx.db
      .select({ count: count() })
      .from(orders)
      .where(gte(orders.createdAt, currentMonthStart));
    const currentMonthOrders = currentMonthOrdersResult[0]?.count ?? 0;

    // Last month orders
    const lastMonthOrdersResult = await ctx.db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, lastMonthStart),
          lt(orders.createdAt, currentMonthStart)
        )
      );
    const lastMonthOrders = lastMonthOrdersResult[0]?.count ?? 0;

    // Total products
    const productsResult = await ctx.db
      .select({ count: count() })
      .from(products)
      .where(eq(products.isActive, true));
    const totalProducts = productsResult[0]?.count ?? 0;

    // Low stock count
    const lowStockResult = await ctx.db
      .select({ count: count() })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          sql`${products.stockQuantity}::numeric <= ${products.lowStockThreshold}::numeric`
        )
      );
    const lowStockCount = lowStockResult[0]?.count ?? 0;

    // Total customers (all time)
    const customersResult = await ctx.db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "customer"));
    const totalCustomers = customersResult[0]?.count ?? 0;

    // Current month new customers
    const currentMonthCustomersResult = await ctx.db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.role, "customer"),
          gte(users.createdAt, currentMonthStart)
        )
      );
    const currentMonthCustomers = currentMonthCustomersResult[0]?.count ?? 0;

    // Last month new customers
    const lastMonthCustomersResult = await ctx.db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.role, "customer"),
          gte(users.createdAt, lastMonthStart),
          lt(users.createdAt, currentMonthStart)
        )
      );
    const lastMonthCustomers = lastMonthCustomersResult[0]?.count ?? 0;

    // Orders by status
    const statusResult = await ctx.db
      .select({
        status: orders.status,
        count: count(),
      })
      .from(orders)
      .groupBy(orders.status);

    const ordersByStatus: Record<string, number> = {};
    statusResult.forEach((row) => {
      ordersByStatus[row.status] = row.count;
    });

    // Calculate growth percentages
    const revenueGrowth = calculateGrowth(currentMonthRevenue, lastMonthRevenue);
    const ordersGrowth = calculateGrowth(currentMonthOrders, lastMonthOrders);
    const customersGrowth = calculateGrowth(currentMonthCustomers, lastMonthCustomers);

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      lowStockCount,
      totalCustomers,
      ordersByStatus,
      // Growth metrics
      currentMonthRevenue,
      lastMonthRevenue,
      revenueGrowth,
      currentMonthOrders,
      lastMonthOrders,
      ordersGrowth,
      currentMonthCustomers,
      lastMonthCustomers,
      customersGrowth,
    };
  }),

  // Get recent orders
  getRecentOrders: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(5) }))
    .query(async ({ ctx, input }) => {
      const recentOrders = await ctx.db.query.orders.findMany({
        orderBy: [desc(orders.createdAt)],
        limit: input.limit,
        columns: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
        },
        with: {
          user: {
            columns: {
              name: true,
              email: true,
            },
          },
        },
      });

      return recentOrders;
    }),

  // Get low stock products
  getLowStockProducts: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(5) }))
    .query(async ({ ctx, input }) => {
      const lowStockProducts = await ctx.db.query.products.findMany({
        where: and(
          eq(products.isActive, true),
          sql`${products.stockQuantity}::numeric <= ${products.lowStockThreshold}::numeric`
        ),
        orderBy: [sql`${products.stockQuantity}::numeric ASC`],
        limit: input.limit,
        columns: {
          id: true,
          name: true,
          sku: true,
          stockQuantity: true,
          lowStockThreshold: true,
        },
      });

      return lowStockProducts;
    }),

  // Get all orders with pagination
  getOrders: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().nullish(),
        status: z
          .enum([
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "refunded",
          ])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, status } = input;

      const whereClause = status ? eq(orders.status, status) : undefined;

      const allOrders = await ctx.db.query.orders.findMany({
        where: whereClause,
        orderBy: [desc(orders.createdAt)],
        limit: limit + 1,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: true,
        },
      });

      let nextCursor: string | undefined;
      if (allOrders.length > limit) {
        const nextItem = allOrders.pop();
        nextCursor = nextItem?.id;
      }

      return {
        orders: allOrders,
        nextCursor,
      };
    }),

  // Update order status
  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum([
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded",
        ]),
        trackingNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
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

      const updateData: Record<string, unknown> = {
        status: input.status,
      };

      if (input.trackingNumber) {
        updateData.trackingNumber = input.trackingNumber;
      }

      if (input.status === "shipped") {
        updateData.shippedAt = new Date();
      } else if (input.status === "delivered") {
        updateData.deliveredAt = new Date();
        updateData.paymentStatus = "paid";
      }

      // Restore stock if order is cancelled (and wasn't already cancelled)
      if (input.status === "cancelled" && order.status !== "cancelled") {
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
      }

      await ctx.db
        .update(orders)
        .set(updateData)
        .where(eq(orders.id, input.orderId));

      return { success: true };
    }),

  // Get all products with pagination
  getProducts: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().nullish(),
        search: z.string().optional(),
        categoryId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, search, categoryId } = input;

      let whereClause;
      if (categoryId) {
        whereClause = eq(products.categoryId, categoryId);
      }

      const allProducts = await ctx.db.query.products.findMany({
        where: whereClause,
        orderBy: [desc(products.createdAt)],
        limit: limit + 1,
        with: {
          category: {
            columns: {
              id: true,
              name: true,
            },
          },
          images: {
            columns: {
              id: true,
              url: true,
            },
            limit: 1,
          },
        },
      });

      let nextCursor: string | undefined;
      if (allProducts.length > limit) {
        const nextItem = allProducts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        products: allProducts,
        nextCursor,
      };
    }),

  // Toggle product active status
  toggleProductStatus: adminProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      await ctx.db
        .update(products)
        .set({ isActive: !product.isActive })
        .where(eq(products.id, input.productId));

      return { success: true, isActive: !product.isActive };
    }),

  // Get all categories
  getCategories: adminProcedure.query(async ({ ctx }) => {
    const allCategories = await ctx.db.query.categories.findMany({
      orderBy: [categories.position],
    });

    return allCategories;
  }),

  // Create category
  createCategory: adminProcedure
    .input(
      z.object({
        name: z.string().min(2),
        slug: z.string().min(2),
        description: z.string().optional(),
        image: z.string().optional(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [category] = await ctx.db
        .insert(categories)
        .values(input)
        .returning();

      return category;
    }),

  // Update category
  updateCategory: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        slug: z.string().min(2).optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      await ctx.db
        .update(categories)
        .set(updateData)
        .where(eq(categories.id, id));

      return { success: true };
    }),

  // Delete category
  deleteCategory: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if category has products
      const productsInCategory = await ctx.db.query.products.findFirst({
        where: eq(products.categoryId, input.id),
      });

      if (productsInCategory) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete category with products. Move products first.",
        });
      }

      await ctx.db.delete(categories).where(eq(categories.id, input.id));

      return { success: true };
    }),

  // Create product
  createProduct: adminProcedure
    .input(
      z.object({
        name: z.string().min(2),
        slug: z.string().min(2),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        price: z.number().positive(),
        comparePrice: z.number().positive().optional(),
        costPrice: z.number().positive().optional(),
        sellingMode: z.enum(["meter", "piece"]).default("meter"),
        unit: z.enum(["meter", "yard", "piece", "set", "kg"]).default("meter"),
        minOrderQuantity: z.number().positive().default(1),
        quantityStep: z.number().positive().default(0.5),
        maxOrderQuantity: z.number().positive().optional(),
        sku: z.string().optional(),
        fabricType: z.string().optional(),
        material: z.string().optional(),
        width: z.string().optional(),
        weight: z.string().optional(),
        color: z.string().optional(),
        pattern: z.string().optional(),
        composition: z.string().optional(),
        stockQuantity: z.number().default(0),
        lowStockThreshold: z.number().default(10),
        categoryId: z.string(),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        images: z.array(z.object({
          url: z.string(),
          alt: z.string().optional(),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { images, ...productData } = input;

      // Check if slug already exists
      const existingProduct = await ctx.db.query.products.findFirst({
        where: eq(products.slug, input.slug),
      });

      if (existingProduct) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A product with this slug already exists",
        });
      }

      // Create product
      const [product] = await ctx.db
        .insert(products)
        .values({
          ...productData,
          price: productData.price.toString(),
          comparePrice: productData.comparePrice?.toString(),
          costPrice: productData.costPrice?.toString(),
          minOrderQuantity: productData.minOrderQuantity.toString(),
          quantityStep: productData.quantityStep.toString(),
          maxOrderQuantity: productData.maxOrderQuantity?.toString(),
          stockQuantity: productData.stockQuantity.toString(),
          lowStockThreshold: productData.lowStockThreshold.toString(),
        })
        .returning();

      // Add images if provided
      if (images && images.length > 0 && product) {
        await ctx.db.insert(productImages).values(
          images.map((img, idx) => ({
            productId: product.id,
            url: img.url,
            alt: img.alt ?? product.name,
            position: idx,
          }))
        );
      }

      return product;
    }),

  // Update product
  updateProduct: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        slug: z.string().min(2).optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        price: z.number().positive().optional(),
        comparePrice: z.number().positive().nullable().optional(),
        costPrice: z.number().positive().nullable().optional(),
        sellingMode: z.enum(["meter", "piece"]).optional(),
        unit: z.enum(["meter", "yard", "piece", "set", "kg"]).optional(),
        minOrderQuantity: z.number().positive().optional(),
        quantityStep: z.number().positive().optional(),
        maxOrderQuantity: z.number().positive().nullable().optional(),
        sku: z.string().nullable().optional(),
        fabricType: z.string().nullable().optional(),
        material: z.string().nullable().optional(),
        width: z.string().nullable().optional(),
        weight: z.string().nullable().optional(),
        color: z.string().nullable().optional(),
        pattern: z.string().nullable().optional(),
        composition: z.string().nullable().optional(),
        stockQuantity: z.number().optional(),
        lowStockThreshold: z.number().optional(),
        categoryId: z.string().optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, id),
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check if new slug conflicts with existing product
      if (updateData.slug && updateData.slug !== product.slug) {
        const existingProduct = await ctx.db.query.products.findFirst({
          where: eq(products.slug, updateData.slug),
        });
        if (existingProduct) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A product with this slug already exists",
          });
        }
      }

      // Convert numbers to strings for database
      const dbUpdateData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(updateData)) {
        if (value === undefined) continue;
        if (["price", "comparePrice", "costPrice", "minOrderQuantity", "quantityStep", "maxOrderQuantity", "stockQuantity", "lowStockThreshold"].includes(key)) {
          dbUpdateData[key] = value === null ? null : String(value);
        } else {
          dbUpdateData[key] = value;
        }
      }

      await ctx.db
        .update(products)
        .set(dbUpdateData)
        .where(eq(products.id, id));

      return { success: true };
    }),

  // Delete product
  deleteProduct: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.id),
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      await ctx.db.delete(products).where(eq(products.id, input.id));

      return { success: true };
    }),

  // Add product image
  addProductImage: adminProcedure
    .input(
      z.object({
        productId: z.string(),
        url: z.string(),
        alt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current max position
      const existingImages = await ctx.db.query.productImages.findMany({
        where: eq(productImages.productId, input.productId),
      });
      const position = existingImages.length;

      const [image] = await ctx.db
        .insert(productImages)
        .values({
          productId: input.productId,
          url: input.url,
          alt: input.alt,
          position,
        })
        .returning();

      return image;
    }),

  // Delete product image
  deleteProductImage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(productImages).where(eq(productImages.id, input.id));
      return { success: true };
    }),

  // Get single product for editing
  getProduct: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.id),
        with: {
          category: true,
          images: true,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return product;
    }),

  // Get all customers with pagination
  getCustomers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().nullish(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, search } = input;

      // Build where clause with optional search
      let whereClause = eq(users.role, "customer");
      if (search && search.trim()) {
        whereClause = and(
          eq(users.role, "customer"),
          or(
            like(users.name, `%${search}%`),
            like(users.email, `%${search}%`),
            like(users.phone, `%${search}%`)
          )
        ) as typeof whereClause;
      }

      const allCustomers = await ctx.db.query.users.findMany({
        where: whereClause,
        orderBy: [desc(users.createdAt)],
        limit: limit + 1,
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          emailVerified: true,
        },
      });

      // Get order counts and totals for each customer
      const customerIds = allCustomers.map((c) => c.id);
      
      let statsMap = new Map<string, { orderCount: number; totalSpent: number }>();
      
      if (customerIds.length > 0) {
        const orderStats = await ctx.db
          .select({
            userId: orders.userId,
            orderCount: count(),
            totalSpent: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
          })
          .from(orders)
          .where(inArray(orders.userId, customerIds))
          .groupBy(orders.userId);

        statsMap = new Map(
          orderStats.map((s) => [s.userId, { orderCount: s.orderCount, totalSpent: Number(s.totalSpent) }])
        );
      }

      const customersWithStats = allCustomers.map((customer) => ({
        ...customer,
        orderCount: statsMap.get(customer.id)?.orderCount ?? 0,
        totalSpent: statsMap.get(customer.id)?.totalSpent ?? 0,
      }));

      let nextCursor: string | undefined;
      if (customersWithStats.length > limit) {
        const nextItem = customersWithStats.pop();
        nextCursor = nextItem?.id;
      }

      return {
        customers: customersWithStats,
        nextCursor,
      };
    }),

  // Get single customer details
  getCustomer: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          emailVerified: true,
        },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      // Get customer orders
      const customerOrders = await ctx.db.query.orders.findMany({
        where: eq(orders.userId, input.id),
        orderBy: [desc(orders.createdAt)],
        limit: 10,
      });

      // Get total spent
      const totalResult = await ctx.db
        .select({ total: sql<string>`COALESCE(SUM(${orders.total}), 0)` })
        .from(orders)
        .where(eq(orders.userId, input.id));

      return {
        ...customer,
        orders: customerOrders,
        totalSpent: Number(totalResult[0]?.total ?? 0),
        orderCount: customerOrders.length,
      };
    }),

  // Update product stock
  updateStock: adminProcedure
    .input(
      z.object({
        productId: z.string(),
        stockQuantity: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(products)
        .set({ stockQuantity: input.stockQuantity.toString() })
        .where(eq(products.id, input.productId));

      return { success: true };
    }),

  // Get all settings
  getSettings: adminProcedure.query(async ({ ctx }) => {
    const allSettings = await ctx.db.query.settings.findMany();
    
    // Convert to key-value object
    const settingsMap: Record<string, string> = {};
    allSettings.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });
    
    return settingsMap;
  }),

  // Update or create a setting
  updateSetting: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.settings.findFirst({
        where: eq(settings.key, input.key),
      });

      if (existing) {
        await ctx.db
          .update(settings)
          .set({ value: input.value })
          .where(eq(settings.key, input.key));
      } else {
        await ctx.db.insert(settings).values({
          key: input.key,
          value: input.value,
        });
      }

      return { success: true };
    }),

  // Update multiple settings at once
  updateSettings: adminProcedure
    .input(
      z.object({
        settings: z.record(z.string(), z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      for (const [key, value] of Object.entries(input.settings)) {
        const existing = await ctx.db.query.settings.findFirst({
          where: eq(settings.key, key),
        });

        if (existing) {
          await ctx.db
            .update(settings)
            .set({ value })
            .where(eq(settings.key, key));
        } else {
          await ctx.db.insert(settings).values({ key, value });
        }
      }

      return { success: true };
    }),
});
