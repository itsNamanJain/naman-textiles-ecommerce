import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  wishlists,
  wishlistItems,
  products,
  productImages,
} from "@/server/db/schema";

export const wishlistRouter = createTRPCRouter({
  // Get user's wishlist
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get or create wishlist
    let wishlist = await ctx.db.query.wishlists.findFirst({
      where: eq(wishlists.userId, userId),
    });

    if (!wishlist) {
      const [newWishlist] = await ctx.db
        .insert(wishlists)
        .values({ userId })
        .returning();
      wishlist = newWishlist;
    }

    // Get wishlist items with products
    const items = await ctx.db.query.wishlistItems.findMany({
      where: eq(wishlistItems.wishlistId, wishlist!.id),
      with: {
        product: {
          with: {
            category: true,
            images: {
              orderBy: [asc(productImages.position)],
              limit: 1,
            },
          },
        },
      },
      orderBy: [wishlistItems.createdAt],
    });

    // Filter out items where product is inactive
    const activeItems = items.filter((item) => item.product?.isActive);

    return {
      id: wishlist!.id,
      items: activeItems,
      count: activeItems.length,
    };
  }),

  // Add item to wishlist
  add: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if product exists
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Get or create wishlist
      let wishlist = await ctx.db.query.wishlists.findFirst({
        where: eq(wishlists.userId, userId),
      });

      if (!wishlist) {
        const [newWishlist] = await ctx.db
          .insert(wishlists)
          .values({ userId })
          .returning();
        wishlist = newWishlist;
      }

      // Check if item already in wishlist
      const existingItem = await ctx.db.query.wishlistItems.findFirst({
        where: and(
          eq(wishlistItems.wishlistId, wishlist!.id),
          eq(wishlistItems.productId, input.productId)
        ),
      });

      if (existingItem) {
        return { success: true, message: "Item already in wishlist" };
      }

      // Add to wishlist
      await ctx.db.insert(wishlistItems).values({
        wishlistId: wishlist!.id,
        productId: input.productId,
      });

      return { success: true, message: "Added to wishlist" };
    }),

  // Remove item from wishlist
  remove: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const wishlist = await ctx.db.query.wishlists.findFirst({
        where: eq(wishlists.userId, userId),
      });

      if (!wishlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wishlist not found",
        });
      }

      await ctx.db
        .delete(wishlistItems)
        .where(
          and(
            eq(wishlistItems.wishlistId, wishlist.id),
            eq(wishlistItems.productId, input.productId)
          )
        );

      return { success: true, message: "Removed from wishlist" };
    }),

  // Toggle item in wishlist (add if not exists, remove if exists)
  toggle: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if product exists
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Get or create wishlist
      let wishlist = await ctx.db.query.wishlists.findFirst({
        where: eq(wishlists.userId, userId),
      });

      if (!wishlist) {
        const [newWishlist] = await ctx.db
          .insert(wishlists)
          .values({ userId })
          .returning();
        wishlist = newWishlist;
      }

      // Check if item exists in wishlist
      const existingItem = await ctx.db.query.wishlistItems.findFirst({
        where: and(
          eq(wishlistItems.wishlistId, wishlist!.id),
          eq(wishlistItems.productId, input.productId)
        ),
      });

      if (existingItem) {
        // Remove from wishlist
        await ctx.db
          .delete(wishlistItems)
          .where(eq(wishlistItems.id, existingItem.id));
        return {
          success: true,
          isInWishlist: false,
          message: "Removed from wishlist",
        };
      } else {
        // Add to wishlist
        await ctx.db.insert(wishlistItems).values({
          wishlistId: wishlist!.id,
          productId: input.productId,
        });
        return {
          success: true,
          isInWishlist: true,
          message: "Added to wishlist",
        };
      }
    }),

  // Check if product is in wishlist
  isInWishlist: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const wishlist = await ctx.db.query.wishlists.findFirst({
        where: eq(wishlists.userId, userId),
      });

      if (!wishlist) {
        return false;
      }

      const item = await ctx.db.query.wishlistItems.findFirst({
        where: and(
          eq(wishlistItems.wishlistId, wishlist.id),
          eq(wishlistItems.productId, input.productId)
        ),
      });

      return !!item;
    }),

  // Get all product IDs in wishlist (for efficient checking on product lists)
  getProductIds: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const wishlist = await ctx.db.query.wishlists.findFirst({
      where: eq(wishlists.userId, userId),
      with: {
        items: {
          columns: {
            productId: true,
          },
        },
      },
    });

    return wishlist?.items.map((item) => item.productId) ?? [];
  }),

  // Get wishlist count
  count: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const wishlist = await ctx.db.query.wishlists.findFirst({
      where: eq(wishlists.userId, userId),
      with: {
        items: true,
      },
    });

    return wishlist?.items.length ?? 0;
  }),

  // Clear wishlist
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const wishlist = await ctx.db.query.wishlists.findFirst({
      where: eq(wishlists.userId, userId),
    });

    if (wishlist) {
      await ctx.db
        .delete(wishlistItems)
        .where(eq(wishlistItems.wishlistId, wishlist.id));
    }

    return { success: true };
  }),
});
