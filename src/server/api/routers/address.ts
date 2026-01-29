import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const addressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  addressLineOne: z.string().min(5, "Address is required"),
  addressLineTwo: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode required"),
  isDefault: z.boolean().optional().default(false),
});

export const addressRouter = createTRPCRouter({
  // Get all addresses for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const userAddresses = await ctx.db
      .selectFrom("address")
      .selectAll()
      .where("userId", "=", userId)
      .orderBy("isDefault", "desc")
      .orderBy("createdAt", "desc")
      .execute();

    return userAddresses;
  }),

  // Get a single address by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const address = await ctx.db
        .selectFrom("address")
        .selectAll()
        .where("id", "=", input.id)
        .where("userId", "=", userId)
        .executeTakeFirst();

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
          .updateTable("address")
          .set({ isDefault: false })
          .where("userId", "=", userId)
          .execute();
      }

      // Check if user has any addresses, if not make this the default
      const existingAddresses = await ctx.db
        .selectFrom("address")
        .select(["id"])
        .where("userId", "=", userId)
        .execute();

      const isDefault = existingAddresses.length === 0 ? true : input.isDefault;

      const newAddress = await ctx.db
        .insertInto("address")
        .values({
          userId,
          name: input.name,
          phone: input.phone,
          addressLineOne: input.addressLineOne,
          addressLineTwo: input.addressLineTwo ?? null,
          city: input.city,
          state: input.state,
          pincode: input.pincode,
          isDefault,
        })
        .returningAll()
        .executeTakeFirst();

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
      const existingAddress = await ctx.db
        .selectFrom("address")
        .selectAll()
        .where("id", "=", input.id)
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (!existingAddress) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      // If setting as default, unset all other defaults first
      if (input.data.isDefault) {
        await ctx.db
          .updateTable("address")
          .set({ isDefault: false })
          .where("userId", "=", userId)
          .execute();
      }

      const updatedAddress = await ctx.db
        .updateTable("address")
        .set({
          name: input.data.name,
          phone: input.data.phone,
          addressLineOne: input.data.addressLineOne,
          addressLineTwo: input.data.addressLineTwo ?? null,
          city: input.data.city,
          state: input.data.state,
          pincode: input.data.pincode,
          isDefault: input.data.isDefault,
        })
        .where("id", "=", input.id)
        .returningAll()
        .executeTakeFirst();

      return updatedAddress;
    }),

  // Delete an address
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify the address belongs to this user
      const existingAddress = await ctx.db
        .selectFrom("address")
        .selectAll()
        .where("id", "=", input.id)
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (!existingAddress) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      await ctx.db.deleteFrom("address").where("id", "=", input.id).execute();

      // If deleted address was default, set another as default
      if (existingAddress.isDefault) {
        const remainingAddresses = await ctx.db
          .selectFrom("address")
          .selectAll()
          .where("userId", "=", userId)
          .orderBy("createdAt", "desc")
          .limit(1)
          .execute();

        if (remainingAddresses.length > 0 && remainingAddresses[0]) {
          await ctx.db
            .updateTable("address")
            .set({ isDefault: true })
            .where("id", "=", remainingAddresses[0].id)
            .execute();
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
      const existingAddress = await ctx.db
        .selectFrom("address")
        .selectAll()
        .where("id", "=", input.id)
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (!existingAddress) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      // Unset all other defaults
      await ctx.db
        .updateTable("address")
        .set({ isDefault: false })
        .where("userId", "=", userId)
        .execute();

      // Set this one as default
      await ctx.db
        .updateTable("address")
        .set({ isDefault: true })
        .where("id", "=", input.id)
        .execute();

      return { success: true };
    }),
});
