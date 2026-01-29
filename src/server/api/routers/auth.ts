import { z } from "zod";
import { hash } from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { sql } from "kysely";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existingUser = await ctx.db
        .selectFrom("user")
        .select(["id"])
        .where("email", "=", input.email.toLowerCase())
        .executeTakeFirst();

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await hash(input.password, 12);

      // Create user
      const newUser = await ctx.db
        .insertInto("user")
        .values({
          name: input.name,
          email: input.email.toLowerCase(),
          password: hashedPassword,
          phone: input.phone ?? null,
          role: "customer",
        })
        .returning(["id", "name", "email"])
        .executeTakeFirst();

      return {
        success: true,
        user: newUser,
      };
    }),

  // Get current user profile with stats
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get user data
    const user = await ctx.db
      .selectFrom("user")
      .selectAll()
      .where("id", "=", userId)
      .executeTakeFirst();

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Get stats
    const orderCount = await ctx.db
      .selectFrom("order")
      .select(sql<number>`count(*)`.as("count"))
      .where("userId", "=", userId)
      .executeTakeFirst();

    const addressCount = await ctx.db
      .selectFrom("address")
      .select(sql<number>`count(*)`.as("count"))
      .where("userId", "=", userId)
      .executeTakeFirst();

    // Get wishlist count - use the wishlist router's approach
    const wishlistCountResult = await ctx.db
      .selectFrom("wishlist")
      .innerJoin("wishlistItem", "wishlistItem.wishlistId", "wishlist.id")
      .select(sql<number>`count(*)`.as("count"))
      .where("wishlist.userId", "=", userId)
      .executeTakeFirst();
    const wishlistCount = wishlistCountResult?.count ?? 0;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      stats: {
        totalOrders: orderCount?.count ?? 0,
        wishlistItems: wishlistCount,
        savedAddresses: addressCount?.count ?? 0,
      },
    };
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .updateTable("user")
        .set({
          name: input.name,
          phone: input.phone ?? null,
        })
        .where("id", "=", userId)
        .execute();

      return { success: true };
    }),
});
