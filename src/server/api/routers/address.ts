import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { addresses } from "@/server/db/schema";

const addressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode required"),
  isDefault: z.boolean().optional().default(false),
});

export const addressRouter = createTRPCRouter({
  // Get all addresses for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const userAddresses = await ctx.db.query.addresses.findMany({
      where: eq(addresses.userId, userId),
      orderBy: [desc(addresses.isDefault), desc(addresses.createdAt)],
    });

    return userAddresses;
  }),

  // Get a single address by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const address = await ctx.db.query.addresses.findFirst({
        where: and(eq(addresses.id, input.id), eq(addresses.userId, userId)),
      });

      if (!address) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      return address;
    }),

  // Create a new address
  create: protectedProcedure
    .input(addressSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // If this is set as default, unset all other defaults
      if (input.isDefault) {
        await ctx.db
          .update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, userId));
      }

      // Check if user has any addresses, if not make this the default
      const existingAddresses = await ctx.db.query.addresses.findMany({
        where: eq(addresses.userId, userId),
        columns: { id: true },
      });

      const isDefault = existingAddresses.length === 0 ? true : input.isDefault;

      const [newAddress] = await ctx.db
        .insert(addresses)
        .values({
          userId,
          name: input.name,
          phone: input.phone,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2 ?? null,
          city: input.city,
          state: input.state,
          pincode: input.pincode,
          isDefault,
        })
        .returning();

      return newAddress;
    }),

  // Update an existing address
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: addressSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify the address belongs to this user
      const existingAddress = await ctx.db.query.addresses.findFirst({
        where: and(eq(addresses.id, input.id), eq(addresses.userId, userId)),
      });

      if (!existingAddress) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      // If setting as default, unset all other defaults first
      if (input.data.isDefault) {
        await ctx.db
          .update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, userId));
      }

      const [updatedAddress] = await ctx.db
        .update(addresses)
        .set({
          name: input.data.name,
          phone: input.data.phone,
          addressLine1: input.data.addressLine1,
          addressLine2: input.data.addressLine2 ?? null,
          city: input.data.city,
          state: input.data.state,
          pincode: input.data.pincode,
          isDefault: input.data.isDefault,
        })
        .where(eq(addresses.id, input.id))
        .returning();

      return updatedAddress;
    }),

  // Delete an address
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify the address belongs to this user
      const existingAddress = await ctx.db.query.addresses.findFirst({
        where: and(eq(addresses.id, input.id), eq(addresses.userId, userId)),
      });

      if (!existingAddress) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      await ctx.db.delete(addresses).where(eq(addresses.id, input.id));

      // If deleted address was default, set another as default
      if (existingAddress.isDefault) {
        const remainingAddresses = await ctx.db.query.addresses.findMany({
          where: eq(addresses.userId, userId),
          orderBy: [desc(addresses.createdAt)],
          limit: 1,
        });

        if (remainingAddresses.length > 0 && remainingAddresses[0]) {
          await ctx.db
            .update(addresses)
            .set({ isDefault: true })
            .where(eq(addresses.id, remainingAddresses[0].id));
        }
      }

      return { success: true };
    }),

  // Set an address as default
  setDefault: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify the address belongs to this user
      const existingAddress = await ctx.db.query.addresses.findFirst({
        where: and(eq(addresses.id, input.id), eq(addresses.userId, userId)),
      });

      if (!existingAddress) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      // Unset all other defaults
      await ctx.db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));

      // Set this one as default
      await ctx.db
        .update(addresses)
        .set({ isDefault: true })
        .where(eq(addresses.id, input.id));

      return { success: true };
    }),
});
