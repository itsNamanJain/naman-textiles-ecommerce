import { z } from "zod";
import { eq, asc, and } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { categories } from "@/server/db/schema";

export const categoryRouter = createTRPCRouter({
  // Get all active categories
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.categories.findMany({
      where: eq(categories.isActive, true),
      orderBy: [asc(categories.position), asc(categories.name)],
    });
  }),

  // Get all categories with product counts (only counts active products)
  getAllWithCounts: publicProcedure.query(async ({ ctx }) => {
    const allCategories = await ctx.db.query.categories.findMany({
      where: eq(categories.isActive, true),
      orderBy: [asc(categories.position), asc(categories.name)],
      with: {
        products: {
          columns: { id: true, isActive: true },
        },
      },
    });

    return allCategories.map((cat) => ({
      ...cat,
      productCount: cat.products.filter((p) => p.isActive).length,
      products: undefined,
    }));
  }),

  // Get category by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.categories.findFirst({
        where: and(
          eq(categories.slug, input.slug),
          eq(categories.isActive, true)
        ),
      });
    }),

  // Get category by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.categories.findFirst({
        where: eq(categories.id, input.id),
      });
    }),

  // Get parent categories (no parent)
  getParents: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.categories.findMany({
      where: eq(categories.isActive, true),
      orderBy: [asc(categories.position), asc(categories.name)],
    });

    // Filter for categories without a parent
    return result.filter((cat) => !cat.parentId);
  }),

  // Get child categories
  getChildren: publicProcedure
    .input(z.object({ parentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.categories.findMany({
        where: and(
          eq(categories.parentId, input.parentId),
          eq(categories.isActive, true)
        ),
        orderBy: [asc(categories.position), asc(categories.name)],
      });
    }),
});
