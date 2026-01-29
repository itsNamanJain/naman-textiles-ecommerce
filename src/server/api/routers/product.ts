import { z } from "zod";
import { eq, and, desc, asc, ilike, or, sql, gte, lte } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { products, categories, productImages } from "@/server/db/schema";

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

      // Build where conditions
      const conditions = [eq(products.isActive, true)];

      // Filter by category
      if (categorySlug) {
        const category = await ctx.db.query.categories.findFirst({
          where: eq(categories.slug, categorySlug),
        });
        if (category) {
          conditions.push(eq(products.categoryId, category.id));
        }
      }

      // Search filter
      if (search) {
        conditions.push(
          or(
            ilike(products.name, `%${search}%`),
            ilike(products.description, `%${search}%`),
            ilike(products.fabricType, `%${search}%`),
            ilike(products.material, `%${search}%`),
            ilike(products.color, `%${search}%`)
          ) ?? sql`true`
        );
      }

      // Price filters
      if (minPrice !== undefined) {
        conditions.push(gte(products.price, minPrice.toString()));
      }
      if (maxPrice !== undefined) {
        conditions.push(lte(products.price, maxPrice.toString()));
      }

      // Selling mode filter
      if (sellingMode) {
        conditions.push(eq(products.sellingMode, sellingMode));
      }

      // Featured filter
      if (featured !== undefined) {
        conditions.push(eq(products.isFeatured, featured));
      }

      // New Arrivals filter - products added in last 30 days, excludes featured products
      if (newArrivals) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        conditions.push(gte(products.createdAt, thirtyDaysAgo));
        conditions.push(eq(products.isFeatured, false)); // Exclude featured products
      }

      // Cursor for pagination
      if (cursor) {
        conditions.push(sql`${products.id} > ${cursor}`);
      }

      // Determine sort order
      let orderBy;
      switch (sortBy) {
        case "oldest":
          orderBy = asc(products.createdAt);
          break;
        case "price-asc":
          orderBy = asc(products.price);
          break;
        case "price-desc":
          orderBy = desc(products.price);
          break;
        case "name":
          orderBy = asc(products.name);
          break;
        case "newest":
        default:
          orderBy = desc(products.createdAt);
      }

      const items = await ctx.db.query.products.findMany({
        where: and(...conditions),
        orderBy: [orderBy],
        limit: limit + 1,
        with: {
          category: true,
          images: {
            orderBy: [asc(productImages.position)],
            limit: 2,
          },
        },
      });

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
      return ctx.db.query.products.findMany({
        where: and(eq(products.isActive, true), eq(products.isFeatured, true)),
        limit: input.limit,
        orderBy: [desc(products.createdAt)],
        with: {
          category: true,
          images: {
            orderBy: [asc(productImages.position)],
            limit: 2,
          },
        },
      });
    }),

  // Get product by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.products.findFirst({
        where: and(eq(products.slug, input.slug), eq(products.isActive, true)),
        with: {
          category: true,
          images: {
            orderBy: [asc(productImages.position)],
          },
        },
      });
    }),

  // Get product by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.products.findFirst({
        where: eq(products.id, input.id),
        with: {
          category: true,
          images: {
            orderBy: [asc(productImages.position)],
          },
        },
      });
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
      return ctx.db.query.products.findMany({
        where: and(
          eq(products.categoryId, input.categoryId),
          eq(products.isActive, true),
          sql`${products.id} != ${input.productId}`
        ),
        limit: input.limit,
        orderBy: [desc(products.createdAt)],
        with: {
          category: true,
          images: {
            orderBy: [asc(productImages.position)],
            limit: 1,
          },
        },
      });
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
      return ctx.db.query.products.findMany({
        where: and(
          eq(products.isActive, true),
          or(
            ilike(products.name, `%${input.query}%`),
            ilike(products.description, `%${input.query}%`),
            ilike(products.fabricType, `%${input.query}%`),
            ilike(products.material, `%${input.query}%`),
            ilike(products.color, `%${input.query}%`),
            ilike(products.sku, `%${input.query}%`)
          )
        ),
        limit: input.limit,
        orderBy: [desc(products.createdAt)],
        with: {
          category: true,
          images: {
            orderBy: [asc(productImages.position)],
            limit: 1,
          },
        },
      });
    }),

  // Get products count
  getCount: publicProcedure
    .input(
      z.object({
        categorySlug: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(products.isActive, true)];

      if (input.categorySlug) {
        const category = await ctx.db.query.categories.findFirst({
          where: eq(categories.slug, input.categorySlug),
        });
        if (category) {
          conditions.push(eq(products.categoryId, category.id));
        }
      }

      const result = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(and(...conditions));

      return result[0]?.count ?? 0;
    }),
});
