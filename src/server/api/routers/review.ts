import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { reviews, orders } from "@/server/db/schema";

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().max(255).optional(),
  comment: z.string().min(10).max(2000),
});

export const reviewRouter = createTRPCRouter({
  // Get approved reviews for a product
  getByProduct: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.reviews.findMany({
        where: and(
          eq(reviews.productId, input.productId),
          eq(reviews.isApproved, true)
        ),
        orderBy: [desc(reviews.createdAt)],
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }),

  // Create a review (requires auth, defaults to unapproved)
  create: protectedProcedure
    .input(reviewSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const existing = await ctx.db.query.reviews.findFirst({
        where: and(
          eq(reviews.productId, input.productId),
          eq(reviews.userId, userId)
        ),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already reviewed this product",
        });
      }

      // Check if user purchased the product
      const userOrders = await ctx.db.query.orders.findMany({
        where: eq(orders.userId, userId),
        with: {
          items: {
            columns: {
              productId: true,
            },
          },
        },
      });
      const isVerified = userOrders.some((order) =>
        order.items.some((item) => item.productId === input.productId)
      );

      const [created] = await ctx.db
        .insert(reviews)
        .values({
          userId,
          productId: input.productId,
          rating: input.rating,
          title: input.title ?? null,
          comment: input.comment,
          isVerified,
          isApproved: false,
        })
        .returning();

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
      let whereClause;
      if (input.status === "pending") {
        whereClause = eq(reviews.isApproved, false);
      } else if (input.status === "approved") {
        whereClause = eq(reviews.isApproved, true);
      }

      return ctx.db.query.reviews.findMany({
        where: whereClause,
        orderBy: [desc(reviews.createdAt)],
        with: {
          user: {
            columns: { id: true, name: true, email: true },
          },
        },
      });
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
      const [updated] = await ctx.db
        .update(reviews)
        .set({ isApproved: input.isApproved })
        .where(eq(reviews.id, input.id))
        .returning();

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
      await ctx.db.delete(reviews).where(eq(reviews.id, input.id));
      return { success: true };
    }),
});
