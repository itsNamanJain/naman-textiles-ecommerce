import { z } from "zod";
import { sql } from "kysely";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "@/server/api/trpc";

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(2000),
});

export const reviewRouter = createTRPCRouter({
  // Get approved reviews for a product
  getByProduct: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .selectFrom("review")
        .selectAll("review")
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("user")
              .select(["id", "name", "image"])
              .whereRef("user.id", "=", "review.userId")
          ).as("user"),
        ])
        .where("review.productId", "=", input.productId)
        .where("review.isApproved", "=", true)
        .orderBy("review.createdAt", "desc")
        .execute();
    }),

  // Create a review (requires auth, defaults to unapproved)
  create: protectedProcedure
    .input(reviewSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.db
        .selectFrom("review")
        .select(["id"])
        .where("productId", "=", input.productId)
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already reviewed this product",
        });
      }

      // Check if user purchased the product
      const purchaseCheck = await ctx.db
        .selectFrom("order")
        .innerJoin("orderItem", "orderItem.orderId", "order.id")
        .select(sql<number>`count(*)`.as("count"))
        .where("order.userId", "=", userId)
        .where("orderItem.productId", "=", input.productId)
        .executeTakeFirst();
      const isVerified = Number(purchaseCheck?.count ?? 0) > 0;

      const created = await ctx.db
        .insertInto("review")
        .values({
          userId,
          productId: input.productId,
          rating: input.rating,
          comment: input.comment,
          isVerified,
          isApproved: false,
        })
        .returningAll()
        .executeTakeFirst();

      return created;
    }),

  // Admin: get reviews (pending by default)
  getAll: adminProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "all"]).default("pending"),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.db
        .selectFrom("review")
        .selectAll("review")
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("user")
              .select(["id", "name", "email"])
              .whereRef("user.id", "=", "review.userId")
          ).as("user"),
        ])
        .orderBy("review.createdAt", "desc");

      if (input.status === "pending") {
        query = query.where("review.isApproved", "=", false);
      } else if (input.status === "approved") {
        query = query.where("review.isApproved", "=", true);
      }

      return query.execute();
    }),

  // Admin: approve or reject review
  setApproval: adminProcedure
    .input(
      z.object({
        id: z.string(),
        isApproved: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db
        .updateTable("review")
        .set({ isApproved: input.isApproved })
        .where("id", "=", input.id)
        .returningAll()
        .executeTakeFirst();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      return { success: true };
    }),

  // Admin: delete review
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.deleteFrom("review").where("id", "=", input.id).execute();
      return { success: true };
    }),
});
