import { z } from "zod";
import { sql } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const productRouter = createTRPCRouter({
  // Get all products with pagination and filters
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(12),
        cursor: z.string().nullish(),
        categorySlug: z.string().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z
          .enum(["newest", "oldest", "price-asc", "price-desc", "name"])
          .default("newest"),
        sellingMode: z.enum(["meter", "piece"]).optional(),
        featured: z.boolean().optional(),
        newArrivals: z.boolean().optional(), // Filter for products added in last 30 days, excludes featured
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        limit,
        cursor,
        categorySlug,
        search,
        minPrice,
        maxPrice,
        sortBy,
        sellingMode,
        featured,
        newArrivals,
      } = input;

      let query = ctx.db
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
              .limit(2)
          ).as("images"),
        ])
        .where("product.isActive", "=", true);

      // Filter by category
      if (categorySlug) {
        const category = await ctx.db
          .selectFrom("category")
          .select(["id"])
          .where("slug", "=", categorySlug)
          .executeTakeFirst();
        if (category) {
          query = query.where("product.categoryId", "=", category.id);
        }
      }

      // Search filter
      if (search) {
        query = query.where((eb) =>
          eb.or([
            eb("product.name", "ilike", `%${search}%`),
            eb("product.description", "ilike", `%${search}%`),
            eb("product.fabricType", "ilike", `%${search}%`),
            eb("product.material", "ilike", `%${search}%`),
            eb("product.color", "ilike", `%${search}%`),
          ])
        );
      }

      // Price filters
      if (minPrice !== undefined) {
        query = query.where("product.price", ">=", minPrice);
      }
      if (maxPrice !== undefined) {
        query = query.where("product.price", "<=", maxPrice);
      }

      // Selling mode filter
      if (sellingMode) {
        query = query.where("product.sellingMode", "=", sellingMode);
      }

      // Featured filter
      if (featured !== undefined) {
        query = query.where("product.isFeatured", "=", featured);
      }

      // New Arrivals filter - products added in last 30 days, excludes featured products
      if (newArrivals) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query
          .where("product.createdAt", ">=", thirtyDaysAgo)
          .where("product.isFeatured", "=", false);
      }

      // Cursor for pagination
      if (cursor) {
        query = query.where("product.id", ">", cursor);
      }

      // Determine sort order
      switch (sortBy) {
        case "oldest":
          query = query.orderBy("product.createdAt", "asc");
          break;
        case "price-asc":
          query = query.orderBy("product.price", "asc");
          break;
        case "price-desc":
          query = query.orderBy("product.price", "desc");
          break;
        case "name":
          query = query.orderBy("product.name", "asc");
          break;
        case "newest":
        default:
          query = query.orderBy("product.createdAt", "desc");
      }

      const items = await query.limit(limit + 1).execute();

      let nextCursor: string | undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  // Get featured products
  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(8) }))
    .query(async ({ ctx, input }) => {
      return ctx.db
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
              .limit(2)
          ).as("images"),
        ])
        .where("product.isActive", "=", true)
        .where("product.isFeatured", "=", true)
        .orderBy("product.createdAt", "desc")
        .limit(input.limit)
        .execute();
    }),

  // Get product by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
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
        .where("product.slug", "=", input.slug)
        .where("product.isActive", "=", true)
        .executeTakeFirst();
    }),

  // Get product by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
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
    }),

  // Get related products (same category)
  getRelated: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        categoryId: z.string(),
        limit: z.number().min(1).max(10).default(4),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
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
              .limit(1)
          ).as("images"),
        ])
        .where("product.categoryId", "=", input.categoryId)
        .where("product.isActive", "=", true)
        .where("product.id", "!=", input.productId)
        .orderBy("product.createdAt", "desc")
        .limit(input.limit)
        .execute();
    }),

  // Search products
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
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
              .limit(1)
          ).as("images"),
        ])
        .where("product.isActive", "=", true)
        .where((eb) =>
          eb.or([
            eb("product.name", "ilike", `%${input.query}%`),
            eb("product.description", "ilike", `%${input.query}%`),
            eb("product.fabricType", "ilike", `%${input.query}%`),
            eb("product.material", "ilike", `%${input.query}%`),
            eb("product.color", "ilike", `%${input.query}%`),
            eb("product.sku", "ilike", `%${input.query}%`),
          ])
        )
        .orderBy("product.createdAt", "desc")
        .limit(input.limit)
        .execute();
    }),

  // Get products count
  getCount: publicProcedure
    .input(
      z.object({
        categorySlug: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.db
        .selectFrom("product")
        .select(sql<number>`count(*)`.as("count"))
        .where("product.isActive", "=", true);

      if (input.categorySlug) {
        const category = await ctx.db
          .selectFrom("category")
          .select(["id"])
          .where("slug", "=", input.categorySlug)
          .executeTakeFirst();
        if (category) {
          query = query.where("product.categoryId", "=", category.id);
        }
      }

      const result = await query.executeTakeFirst();
      return result?.count ?? 0;
    }),
});
