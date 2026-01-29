import { z } from "zod";
import { sql } from "kysely";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const categoryRouter = createTRPCRouter({
  // Get all active categories
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .selectFrom("category")
      .selectAll()
      .orderBy("name", "asc")
      .execute();
  }),

  // Get all categories with product counts (only counts active products)
  getAllWithCounts: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .selectFrom("category")
      .selectAll()
      .select([
        sql<number>`(
          select count(*) from "product" p
          where p."category_id" = "category"."id"
            and p."is_active" = true
        )`.as("productCount"),
      ])
      .orderBy("name", "asc")
      .execute();

    return rows.map(({ productCount, ...rest }) => ({
      ...rest,
      productCount,
    }));
  }),

  // Get category by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .selectFrom("category")
        .selectAll()
        .where("slug", "=", input.slug)
        .executeTakeFirst();
    }),

  // Get category by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .selectFrom("category")
        .selectAll()
        .where("id", "=", input.id)
        .executeTakeFirst();
    }),
});
