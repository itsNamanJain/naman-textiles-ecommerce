import { z } from "zod";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const wishlistRouter = createTRPCRouter({
  // Get user's wishlist
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get or create wishlist
    let wishlist = await ctx.db
      .selectFrom("wishlist")
      .selectAll()
      .where("userId", "=", userId)
      .executeTakeFirst();

    if (!wishlist) {
      const newWishlist = await ctx.db
        .insertInto("wishlist")
        .values({ userId })
        .returningAll()
        .executeTakeFirst();
      wishlist = newWishlist;
    }

    // Get wishlist items with products
    const items = await ctx.db
      .selectFrom("wishlistItem")
      .select((eb) => [
        "wishlistItem.id",
        "wishlistItem.wishlistId",
        "wishlistItem.productId",
        "wishlistItem.createdAt",
        jsonObjectFrom(
          eb
            .selectFrom("product")
            .selectAll()
            .select((eb2) => [
              jsonObjectFrom(
                eb2
                  .selectFrom("category")
                  .selectAll()
                  .whereRef("category.id", "=", "product.categoryId")
              ).as("category"),
              jsonArrayFrom(
                eb2
                  .selectFrom("productImage")
                  .select(["productImage.url", "productImage.alt"])
                  .whereRef("productImage.productId", "=", "product.id")
                  .orderBy("productImage.position", "asc")
              ).as("images"),
            ])
            .whereRef("product.id", "=", "wishlistItem.productId")
        ).as("product"),
      ])
      .where("wishlistItem.wishlistId", "=", wishlist!.id)
      .orderBy("wishlistItem.createdAt", "asc")
      .execute();

    // make sure the items having product and its category is not null
    const validItems = items.filter(
      (item) => item.product && item.product.category
    );

    // Filter out items where product is inactive
    const activeItems = validItems.filter((item) => item.product?.isActive);

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
      const product = await ctx.db
        .selectFrom("product")
        .select(["id"])
        .where("id", "=", input.productId)
        .executeTakeFirst();

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Get or create wishlist
      let wishlist = await ctx.db
        .selectFrom("wishlist")
        .selectAll()
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (!wishlist) {
        const newWishlist = await ctx.db
          .insertInto("wishlist")
          .values({ userId })
          .returningAll()
          .executeTakeFirst();
        wishlist = newWishlist;
      }

      // Check if item already in wishlist
      const existingItem = await ctx.db
        .selectFrom("wishlistItem")
        .select(["id"])
        .where("wishlistId", "=", wishlist!.id)
        .where("productId", "=", input.productId)
        .executeTakeFirst();

      if (existingItem) {
        return { success: true, message: "Item already in wishlist" };
      }

      // Add to wishlist
      await ctx.db.insertInto("wishlistItem").values({
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

      const wishlist = await ctx.db
        .selectFrom("wishlist")
        .selectAll()
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (!wishlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wishlist not found",
        });
      }

      await ctx.db
        .deleteFrom("wishlistItem")
        .where("wishlistId", "=", wishlist.id)
        .where("productId", "=", input.productId)
        .execute();

      return { success: true, message: "Removed from wishlist" };
    }),

  // Toggle item in wishlist (add if not exists, remove if exists)
  toggle: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if product exists
      const product = await ctx.db
        .selectFrom("product")
        .select(["id"])
        .where("id", "=", input.productId)
        .executeTakeFirst();

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Get or create wishlist
      let wishlist = await ctx.db
        .selectFrom("wishlist")
        .selectAll()
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (!wishlist) {
        const newWishlist = await ctx.db
          .insertInto("wishlist")
          .values({ userId })
          .returningAll()
          .executeTakeFirst();
        wishlist = newWishlist;
      }

      // Check if item exists in wishlist
      const existingItem = await ctx.db
        .selectFrom("wishlistItem")
        .select(["id"])
        .where("wishlistId", "=", wishlist!.id)
        .where("productId", "=", input.productId)
        .executeTakeFirst();

      if (existingItem) {
        // Remove from wishlist
        await ctx.db
          .deleteFrom("wishlistItem")
          .where("id", "=", existingItem.id)
          .execute();
        return {
          success: true,
          isInWishlist: false,
          message: "Removed from wishlist",
        };
      } else {
        // Add to wishlist
        await ctx.db.insertInto("wishlistItem").values({
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

      const wishlist = await ctx.db
        .selectFrom("wishlist")
        .selectAll()
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (!wishlist) {
        return false;
      }

      const item = await ctx.db
        .selectFrom("wishlistItem")
        .select(["id"])
        .where("wishlistId", "=", wishlist.id)
        .where("productId", "=", input.productId)
        .executeTakeFirst();

      return !!item;
    }),

  // Get all product IDs in wishlist (for efficient checking on product lists)
  getProductIds: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const rows = await ctx.db
      .selectFrom("wishlist")
      .innerJoin("wishlistItem", "wishlistItem.wishlistId", "wishlist.id")
      .select(["wishlistItem.productId"])
      .where("wishlist.userId", "=", userId)
      .execute();

    return rows.map((item) => item.productId);
  }),

  // Get wishlist count
  count: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const result = await ctx.db
      .selectFrom("wishlist")
      .innerJoin("wishlistItem", "wishlistItem.wishlistId", "wishlist.id")
      .select((eb) => eb.fn.countAll().as("count"))
      .where("wishlist.userId", "=", userId)
      .executeTakeFirst();

    return Number(result?.count ?? 0);
  }),

  // Clear wishlist
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const wishlist = await ctx.db
      .selectFrom("wishlist")
      .selectAll()
      .where("userId", "=", userId)
      .executeTakeFirst();

    if (wishlist) {
      await ctx.db
        .deleteFrom("wishlistItem")
        .where("wishlistId", "=", wishlist.id)
        .execute();
    }

    return { success: true };
  }),
});
