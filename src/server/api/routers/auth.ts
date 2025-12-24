import { z } from "zod";
import { hash } from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { eq, count } from "drizzle-orm";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { users, addresses, orders, wishlists } from "@/server/db/schema";

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
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email.toLowerCase()),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await hash(input.password, 12);

      // Create user
      const [newUser] = await ctx.db
        .insert(users)
        .values({
          name: input.name,
          email: input.email.toLowerCase(),
          password: hashedPassword,
          phone: input.phone ?? null,
          role: "customer",
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
        });

      return {
        success: true,
        user: newUser,
      };
    }),

  // Get current user profile with stats
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get user data
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Get stats
    const [orderCount] = await ctx.db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.userId, userId));

    const [addressCount] = await ctx.db
      .select({ count: count() })
      .from(addresses)
      .where(eq(addresses.userId, userId));

    // Get wishlist count - use the wishlist router's approach
    const wishlist = await ctx.db.query.wishlists.findFirst({
      where: eq(wishlists.userId, userId),
      with: {
        items: true,
      },
    });
    const wishlistCount = wishlist?.items?.length ?? 0;

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
        .update(users)
        .set({
          name: input.name,
          phone: input.phone ?? null,
        })
        .where(eq(users.id, userId));

      return { success: true };
    }),
});
