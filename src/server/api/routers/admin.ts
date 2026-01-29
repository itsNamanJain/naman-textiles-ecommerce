import { z } from "zod";
import { sql } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { env } from "@/env";

// Helper function to calculate growth percentage
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

function extractCloudinaryPublicId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const uploadIndex = parsed.pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;
    const afterUpload = parsed.pathname.slice(uploadIndex + "/upload/".length);
    let segments = afterUpload.split("/").filter(Boolean);

    const versionIndex = segments.findIndex((seg) => /^v\\d+$/.test(seg));
    if (versionIndex >= 0) {
      segments = segments.slice(versionIndex + 1);
    }

    if (segments.length === 0) return null;
    const joined = segments.join("/");
    return joined.replace(/\\.[^/.]+$/, "");
  } catch {
    return null;
  }
}

async function deleteCloudinaryImageByUrl(url: string, publicId?: string) {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Cloudinary server env vars missing");
    return;
  }

  const resolvedPublicId = publicId ?? extractCloudinaryPublicId(url);
  if (!resolvedPublicId) {
    console.error("Unable to derive Cloudinary public_id from URL", url);
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `invalidate=true&public_id=${resolvedPublicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto
    .createHash("sha1")
    .update(signatureBase)
    .digest("hex");

  const body = new URLSearchParams({
    public_id: resolvedPublicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
    invalidate: "true",
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Cloudinary destroy failed", {
      status: response.status,
      statusText: response.statusText,
      errorText,
    });
    return;
  }

  try {
    const data = (await response.json()) as { result?: string };
    if (data.result && data.result !== "ok") {
      console.error("Cloudinary destroy non-ok result", {
        publicId: resolvedPublicId,
        result: data.result,
      });
    }
  } catch (error) {
    console.error("Cloudinary destroy parse error", error);
  }
}

export const adminRouter = createTRPCRouter({
  // Get dashboard stats with growth metrics
  getStats: adminProcedure.query(async ({ ctx }) => {
    // Calculate date ranges
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total revenue (all time)
    const revenueResult = await ctx.db
      .selectFrom("order")
      .select(sql<number>`COALESCE(SUM("order"."total"), 0)`.as("total"))
      .where("order.paymentStatus", "=", "paid")
      .executeTakeFirst();
    const totalRevenue = Number(revenueResult?.total ?? 0);

    // Current month revenue
    const currentMonthRevenueResult = await ctx.db
      .selectFrom("order")
      .select(sql<number>`COALESCE(SUM("order"."total"), 0)`.as("total"))
      .where("order.paymentStatus", "=", "paid")
      .where("order.createdAt", ">=", currentMonthStart)
      .executeTakeFirst();
    const currentMonthRevenue = Number(currentMonthRevenueResult?.total ?? 0);

    // Last month revenue
    const lastMonthRevenueResult = await ctx.db
      .selectFrom("order")
      .select(sql<number>`COALESCE(SUM("order"."total"), 0)`.as("total"))
      .where("order.paymentStatus", "=", "paid")
      .where("order.createdAt", ">=", lastMonthStart)
      .where("order.createdAt", "<", currentMonthStart)
      .executeTakeFirst();
    const lastMonthRevenue = Number(lastMonthRevenueResult?.total ?? 0);

    // Total orders (all time)
    const ordersResult = await ctx.db
      .selectFrom("order")
      .select(sql<number>`count(*)`.as("count"))
      .executeTakeFirst();
    const totalOrders = Number(ordersResult?.count ?? 0);

    // Current month orders
    const currentMonthOrdersResult = await ctx.db
      .selectFrom("order")
      .select(sql<number>`count(*)`.as("count"))
      .where("order.createdAt", ">=", currentMonthStart)
      .executeTakeFirst();
    const currentMonthOrders = Number(currentMonthOrdersResult?.count ?? 0);

    // Last month orders
    const lastMonthOrdersResult = await ctx.db
      .selectFrom("order")
      .select(sql<number>`count(*)`.as("count"))
      .where("order.createdAt", ">=", lastMonthStart)
      .where("order.createdAt", "<", currentMonthStart)
      .executeTakeFirst();
    const lastMonthOrders = Number(lastMonthOrdersResult?.count ?? 0);

    // Total products
    const productsResult = await ctx.db
      .selectFrom("product")
      .select(sql<number>`count(*)`.as("count"))
      .where("product.isActive", "=", true)
      .executeTakeFirst();
    const totalProducts = Number(productsResult?.count ?? 0);

    // Low stock count (inventory tracking disabled)
    const lowStockCount = 0;

    // Total customers (all time)
    const customersResult = await ctx.db
      .selectFrom("user")
      .select(sql<number>`count(*)`.as("count"))
      .where("user.role", "=", "customer")
      .executeTakeFirst();
    const totalCustomers = Number(customersResult?.count ?? 0);

    // Current month new customers
    const currentMonthCustomersResult = await ctx.db
      .selectFrom("user")
      .select(sql<number>`count(*)`.as("count"))
      .where("user.role", "=", "customer")
      .where("user.createdAt", ">=", currentMonthStart)
      .executeTakeFirst();
    const currentMonthCustomers = Number(
      currentMonthCustomersResult?.count ?? 0
    );

    // Last month new customers
    const lastMonthCustomersResult = await ctx.db
      .selectFrom("user")
      .select(sql<number>`count(*)`.as("count"))
      .where("user.role", "=", "customer")
      .where("user.createdAt", ">=", lastMonthStart)
      .where("user.createdAt", "<", currentMonthStart)
      .executeTakeFirst();
    const lastMonthCustomers = Number(lastMonthCustomersResult?.count ?? 0);

    // Orders by status
    const statusResult = await ctx.db
      .selectFrom("order")
      .select(["status"])
      .select(sql<number>`count(*)`.as("count"))
      .groupBy("status")
      .execute();

    const ordersByStatus: Record<string, number> = {};
    statusResult.forEach((row) => {
      ordersByStatus[row.status] = Number(row.count);
    });

    // Calculate growth percentages
    const revenueGrowth = calculateGrowth(
      currentMonthRevenue,
      lastMonthRevenue
    );
    const ordersGrowth = calculateGrowth(currentMonthOrders, lastMonthOrders);
    const customersGrowth = calculateGrowth(
      currentMonthCustomers,
      lastMonthCustomers
    );

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
      const recentOrders = await ctx.db
        .selectFrom("order")
        .select(["id", "orderNumber", "total", "status", "createdAt"])
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("user")
              .select(["name", "email"])
              .whereRef("user.id", "=", "order.userId")
          ).as("user"),
        ])
        .orderBy("order.createdAt", "desc")
        .limit(input.limit)
        .execute();

      return recentOrders;
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

      let query = ctx.db
        .selectFrom("order")
        .selectAll("order")
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("user")
              .select(["id", "name", "email"])
              .whereRef("user.id", "=", "order.userId")
          ).as("user"),
          jsonArrayFrom(
            eb
              .selectFrom("orderItem")
              .selectAll()
              .whereRef("orderItem.orderId", "=", "order.id")
          ).as("items"),
          jsonObjectFrom(
            eb
              .selectFrom("cancellationRequest")
              .select(["id", "status", "reason", "createdAt"])
              .whereRef("cancellationRequest.orderId", "=", "order.id")
          ).as("cancellationRequest"),
        ])
        .orderBy("order.createdAt", "desc");

      if (status) {
        query = query.where("order.status", "=", status);
      }

      const allOrders = await query.limit(limit + 1).execute();

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
        .executeTakeFirst();

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

      await ctx.db
        .updateTable("order")
        .set(updateData)
        .where("order.id", "=", input.orderId)
        .execute();

      return { success: true };
    }),

  // Approve or reject cancellation requests
  updateCancellationRequest: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(["approved", "rejected"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db
        .selectFrom("cancellationRequest")
        .selectAll()
        .where("cancellationRequest.orderId", "=", input.orderId)
        .executeTakeFirst();

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cancellation request not found",
        });
      }

      await ctx.db
        .updateTable("cancellationRequest")
        .set({ status: input.status })
        .where("cancellationRequest.id", "=", request.id)
        .execute();

      if (input.status === "approved") {
        await ctx.db
          .updateTable("order")
          .set({ status: "cancelled" })
          .where("order.id", "=", input.orderId)
          .execute();
      }

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

      let query = ctx.db
        .selectFrom("product")
        .selectAll("product")
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("category")
              .select(["id", "name"])
              .whereRef("category.id", "=", "product.categoryId")
          ).as("category"),
          jsonArrayFrom(
            eb
              .selectFrom("productImage")
              .select(["id", "url"])
              .whereRef("productImage.productId", "=", "product.id")
              .orderBy("position", "asc")
              .limit(1)
          ).as("images"),
        ])
        .orderBy("product.createdAt", "desc");

      if (categoryId) {
        query = query.where("product.categoryId", "=", categoryId);
      }

      if (search && search.trim()) {
        query = query.where((eb) =>
          eb.or([
            eb("product.name", "ilike", `%${search}%`),
            eb("product.slug", "ilike", `%${search}%`),
          ])
        );
      }

      const allProducts = await query.limit(limit + 1).execute();

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
      const product = await ctx.db
        .selectFrom("product")
        .select(["id", "isActive"])
        .where("product.id", "=", input.productId)
        .executeTakeFirst();

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      await ctx.db
        .updateTable("product")
        .set({ isActive: !product.isActive })
        .where("product.id", "=", input.productId)
        .execute();

      return { success: true, isActive: !product.isActive };
    }),

  // Get all categories
  getCategories: adminProcedure.query(async ({ ctx }) => {
    const allCategories = await ctx.db
      .selectFrom("category")
      .selectAll()
      .orderBy("category.name", "asc")
      .execute();

    return allCategories;
  }),

  // Create category
  createCategory: adminProcedure
    .input(
      z.object({
        name: z.string().min(2),
        slug: z.string().min(2),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db
        .insertInto("category")
        .values(input)
        .returningAll()
        .executeTakeFirst();

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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      await ctx.db
        .updateTable("category")
        .set(updateData)
        .where("category.id", "=", id)
        .execute();

      return { success: true };
    }),

  // Delete category
  deleteCategory: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if category has products
      const productsInCategory = await ctx.db
        .selectFrom("product")
        .select(["id"])
        .where("product.categoryId", "=", input.id)
        .executeTakeFirst();

      if (productsInCategory) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete category with products. Move products first.",
        });
      }

      await ctx.db
        .deleteFrom("category")
        .where("category.id", "=", input.id)
        .execute();

      return { success: true };
    }),

  // Create product
  createProduct: adminProcedure
    .input(
      z.object({
        name: z.string().min(2),
        slug: z.string().min(2),
        description: z.string().optional(),
        price: z.number().positive(),
        comparePrice: z.number().positive().optional(),
        sellingMode: z.enum(["meter", "piece"]).default("meter"),
        minOrderQuantity: z.number().positive().default(1),
        categoryId: z.string(),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        images: z
          .array(
            z.object({
              url: z.string(),
              alt: z.string().optional(),
              publicId: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { images, ...productData } = input;

      // Check if slug already exists
      const existingProduct = await ctx.db
        .selectFrom("product")
        .select(["id"])
        .where("product.slug", "=", input.slug)
        .executeTakeFirst();

      if (existingProduct) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A product with this slug already exists",
        });
      }

      // Create product
      const product = await ctx.db
        .insertInto("product")
        .values({
          ...productData,
          price: productData.price.toString(),
          comparePrice: productData.comparePrice?.toString(),
          minOrderQuantity: productData.minOrderQuantity.toString(),
        })
        .returningAll()
        .executeTakeFirst();

      // Add images if provided
      if (images && images.length > 0 && product) {
        await ctx.db
          .insertInto("productImage")
          .values(
            images.map((img, idx) => ({
              productId: product.id,
              url: img.url,
              alt: img.alt ?? product.name,
              publicId: img.publicId ?? null,
              position: idx,
            }))
          )
          .execute();
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
        price: z.number().positive().optional(),
        comparePrice: z.number().positive().nullable().optional(),
        sellingMode: z.enum(["meter", "piece"]).optional(),
        minOrderQuantity: z.number().positive().optional(),
        categoryId: z.string().optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const product = await ctx.db
        .selectFrom("product")
        .select(["id", "slug"])
        .where("product.id", "=", id)
        .executeTakeFirst();

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check if new slug conflicts with existing product
      if (updateData.slug && updateData.slug !== product.slug) {
        const existingProduct = await ctx.db
          .selectFrom("product")
          .select(["id"])
          .where("product.slug", "=", updateData.slug)
          .executeTakeFirst();
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
        if (["price", "comparePrice", "minOrderQuantity"].includes(key)) {
          dbUpdateData[key] = value === null ? null : String(value);
        } else {
          dbUpdateData[key] = value;
        }
      }

      await ctx.db
        .updateTable("product")
        .set(dbUpdateData)
        .where("product.id", "=", id)
        .execute();

      return { success: true };
    }),

  // Delete product
  deleteProduct: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db
        .selectFrom("product")
        .select(["id"])
        .where("product.id", "=", input.id)
        .executeTakeFirst();

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const productImages = await ctx.db
        .selectFrom("productImage")
        .select(["url", "publicId"])
        .where("productImage.productId", "=", input.id)
        .execute();

      await Promise.all(
        productImages.map((img) =>
          deleteCloudinaryImageByUrl(img.url ?? "", img.publicId ?? undefined)
        )
      );

      await ctx.db
        .deleteFrom("product")
        .where("product.id", "=", input.id)
        .execute();

      return { success: true };
    }),

  // Add product image
  addProductImage: adminProcedure
    .input(
      z.object({
        productId: z.string(),
        url: z.string(),
        alt: z.string().optional(),
        publicId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current max position
      const existingImages = await ctx.db
        .selectFrom("productImage")
        .select(sql<number>`count(*)`.as("count"))
        .where("productImage.productId", "=", input.productId)
        .executeTakeFirst();
      const position = Number(existingImages?.count ?? 0);

      const image = await ctx.db
        .insertInto("productImage")
        .values({
          productId: input.productId,
          url: input.url,
          alt: input.alt ?? null,
          publicId: input.publicId ?? null,
          position,
        })
        .returningAll()
        .executeTakeFirst();

      return image;
    }),

  // Delete product image
  deleteProductImage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const image = await ctx.db
        .selectFrom("productImage")
        .select(["url", "publicId"])
        .where("productImage.id", "=", input.id)
        .executeTakeFirst();

      if (image?.url || image?.publicId) {
        await deleteCloudinaryImageByUrl(
          image?.url ?? "",
          image?.publicId ?? undefined
        );
      }

      await ctx.db
        .deleteFrom("productImage")
        .where("productImage.id", "=", input.id)
        .execute();
      return { success: true };
    }),

  // Get single product for editing
  getProduct: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db
        .selectFrom("product")
        .selectAll("product")
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("category")
              .selectAll()
              .whereRef("category.id", "=", "product.categoryId")
          ).as("category"),
          jsonArrayFrom(
            eb
              .selectFrom("productImage")
              .selectAll()
              .whereRef("productImage.productId", "=", "product.id")
              .orderBy("position", "asc")
          ).as("images"),
        ])
        .where("product.id", "=", input.id)
        .executeTakeFirst();

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

      let query = ctx.db
        .selectFrom("user")
        .select(["id", "name", "email", "phone", "createdAt"])
        .where("user.role", "=", "customer")
        .orderBy("user.createdAt", "desc");

      if (search && search.trim()) {
        query = query.where((eb) =>
          eb.or([
            eb("user.name", "ilike", `%${search}%`),
            eb("user.email", "ilike", `%${search}%`),
            eb("user.phone", "ilike", `%${search}%`),
          ])
        );
      }

      const allCustomers = await query.limit(limit + 1).execute();

      // Get order counts and totals for each customer
      const customerIds = allCustomers.map((c) => c.id);

      let statsMap = new Map<
        string,
        { orderCount: number; totalSpent: number }
      >();

      if (customerIds.length > 0) {
        const orderStats = await ctx.db
          .selectFrom("order")
          .select(["userId"])
          .select(sql<number>`count(*)`.as("orderCount"))
          .select(
            sql<number>`COALESCE(SUM("order"."total"), 0)`.as("totalSpent")
          )
          .where("order.userId", "in", customerIds)
          .groupBy("userId")
          .execute();

        statsMap = new Map(
          orderStats.map((s) => [
            s.userId,
            { orderCount: s.orderCount, totalSpent: Number(s.totalSpent) },
          ])
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
      const customer = await ctx.db
        .selectFrom("user")
        .select(["id", "name", "email", "phone", "createdAt"])
        .where("user.id", "=", input.id)
        .executeTakeFirst();

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      // Get customer orders
      const customerOrders = await ctx.db
        .selectFrom("order")
        .selectAll()
        .where("order.userId", "=", input.id)
        .orderBy("order.createdAt", "desc")
        .limit(10)
        .execute();

      // Get total spent
      const totalResult = await ctx.db
        .selectFrom("order")
        .select(sql<number>`COALESCE(SUM("order"."total"), 0)`.as("total"))
        .where("order.userId", "=", input.id)
        .executeTakeFirst();

      return {
        ...customer,
        orders: customerOrders,
        totalSpent: Number(totalResult?.total ?? 0),
        orderCount: customerOrders.length,
      };
    }),
});
