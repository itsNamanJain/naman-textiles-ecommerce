import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";

const bannerSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  subtitle: z.string().optional(),
  image: z.string().min(1, "Image URL is required"),
  link: z.string().optional(),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
});

export const bannerRouter = createTRPCRouter({
  // Get all active banners (checks date range too)
  getActive: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();

    return ctx.db
      .selectFrom("banner")
      .selectAll()
      .where("isActive", "=", true)
      .where((eb) =>
        eb.or([eb("startDate", "is", null), eb("startDate", "<=", now)])
      )
      .where((eb) =>
        eb.or([eb("endDate", "is", null), eb("endDate", ">=", now)])
      )
      .orderBy("position", "asc")
      .execute();
  }),

  // Get all banners (admin)
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .selectFrom("banner")
      .selectAll()
      .orderBy("position", "asc")
      .execute();
  }),

  // Create banner (admin)
  create: adminProcedure
    .input(bannerSchema)
    .mutation(async ({ ctx, input }) => {
      if (
        input.startDate &&
        input.endDate &&
        input.endDate <= input.startDate
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must be after start date",
        });
      }

      const banner = await ctx.db
        .insertInto("banner")
        .values({
          title: input.title,
          subtitle: input.subtitle?.trim() || null,
          image: input.image,
          link: input.link?.trim() || null,
          position: input.position,
          isActive: input.isActive,
          startDate: input.startDate ?? null,
          endDate: input.endDate ?? null,
        })
        .returningAll()
        .executeTakeFirst();

      return banner;
    }),

  // Update banner (admin)
  update: adminProcedure
    .input(bannerSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (
        input.startDate &&
        input.endDate &&
        input.endDate <= input.startDate
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must be after start date",
        });
      }

      const existing = await ctx.db
        .selectFrom("banner")
        .select(["id"])
        .where("id", "=", input.id)
        .executeTakeFirst();

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Banner not found",
        });
      }

      const updated = await ctx.db
        .updateTable("banner")
        .set({
          title: input.title,
          subtitle: input.subtitle?.trim() || null,
          image: input.image,
          link: input.link?.trim() || null,
          position: input.position,
          isActive: input.isActive,
          startDate: input.startDate ?? null,
          endDate: input.endDate ?? null,
        })
        .where("id", "=", input.id)
        .returningAll()
        .executeTakeFirst();

      return updated;
    }),

  // Delete banner (admin)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.deleteFrom("banner").where("id", "=", input.id).execute();
      return { success: true };
    }),
});
