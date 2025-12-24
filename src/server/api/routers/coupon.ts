import { z } from "zod";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { coupons } from "@/server/db/schema";

const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be at most 20 characters")
    .transform((val) => val.toUpperCase().replace(/\s/g, "")),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive("Discount value must be positive"),
  minPurchase: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().positive().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(true),
});

export const couponRouter = createTRPCRouter({
  // ==================== PUBLIC ROUTES ====================

  // Validate a coupon code (for cart/checkout)
  validate: protectedProcedure
    .input(
      z.object({
        code: z
          .string()
          .transform((val) => val.toUpperCase().replace(/\s/g, "")),
        subtotal: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();

      const coupon = await ctx.db.query.coupons.findFirst({
        where: and(
          eq(coupons.code, input.code),
          eq(coupons.isActive, true),
          lte(coupons.startDate, now),
          gte(coupons.endDate, now)
        ),
      });

      if (!coupon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired coupon code",
        });
      }

      // Check usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This coupon has reached its usage limit",
        });
      }

      // Check minimum purchase
      const minPurchase = Number(coupon.minPurchase ?? 0);
      if (input.subtotal < minPurchase) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Minimum purchase of ₹${minPurchase} required for this coupon`,
        });
      }

      // Calculate discount
      let discount = 0;
      const discountValue = Number(coupon.discountValue);

      if (coupon.discountType === "percentage") {
        discount = (input.subtotal * discountValue) / 100;
        // Apply max discount cap if set
        const maxDiscount = Number(coupon.maxDiscount ?? 0);
        if (maxDiscount > 0 && discount > maxDiscount) {
          discount = maxDiscount;
        }
      } else {
        discount = discountValue;
        // Don't let discount exceed subtotal
        if (discount > input.subtotal) {
          discount = input.subtotal;
        }
      }

      return {
        valid: true,
        couponId: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue,
        discount: Math.round(discount * 100) / 100, // Round to 2 decimal places
        description: coupon.description,
      };
    }),

  // ==================== ADMIN ROUTES ====================

  // Get all coupons (admin)
  getAll: adminProcedure
    .input(
      z.object({
        status: z
          .enum(["all", "active", "inactive", "expired"])
          .optional()
          .default("all"),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();

      let allCoupons = await ctx.db.query.coupons.findMany({
        orderBy: [desc(coupons.createdAt)],
      });

      // Filter based on status
      if (input.status === "active") {
        allCoupons = allCoupons.filter(
          (c) => c.isActive && c.startDate <= now && c.endDate >= now
        );
      } else if (input.status === "inactive") {
        allCoupons = allCoupons.filter((c) => !c.isActive);
      } else if (input.status === "expired") {
        allCoupons = allCoupons.filter((c) => c.endDate < now);
      }

      return allCoupons.map((coupon) => ({
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        isExpired: coupon.endDate < now,
        isUsageLimitReached: coupon.usageLimit
          ? coupon.usageCount >= coupon.usageLimit
          : false,
      }));
    }),

  // Get coupon by ID (admin)
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const coupon = await ctx.db.query.coupons.findFirst({
        where: eq(coupons.id, input.id),
      });

      if (!coupon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Coupon not found",
        });
      }

      return {
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      };
    }),

  // Create coupon (admin)
  create: adminProcedure
    .input(couponSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if code already exists
      const existing = await ctx.db.query.coupons.findFirst({
        where: eq(coupons.code, input.code),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A coupon with this code already exists",
        });
      }

      // Validate dates
      if (input.endDate <= input.startDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must be after start date",
        });
      }

      const [newCoupon] = await ctx.db
        .insert(coupons)
        .values({
          code: input.code,
          description: input.description ?? null,
          discountType: input.discountType,
          discountValue: input.discountValue.toString(),
          minPurchase: input.minPurchase?.toString() ?? null,
          maxDiscount: input.maxDiscount?.toString() ?? null,
          usageLimit: input.usageLimit ?? null,
          startDate: input.startDate,
          endDate: input.endDate,
          isActive: input.isActive,
        })
        .returning();

      return newCoupon;
    }),

  // Update coupon (admin)
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: couponSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.coupons.findFirst({
        where: eq(coupons.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Coupon not found",
        });
      }

      // If changing code, check for duplicates
      if (input.data.code && input.data.code !== existing.code) {
        const duplicate = await ctx.db.query.coupons.findFirst({
          where: eq(coupons.code, input.data.code),
        });

        if (duplicate) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A coupon with this code already exists",
          });
        }
      }

      const updateData: Record<string, unknown> = {};

      if (input.data.code !== undefined) updateData.code = input.data.code;
      if (input.data.description !== undefined)
        updateData.description = input.data.description;
      if (input.data.discountType !== undefined)
        updateData.discountType = input.data.discountType;
      if (input.data.discountValue !== undefined)
        updateData.discountValue = input.data.discountValue.toString();
      if (input.data.minPurchase !== undefined)
        updateData.minPurchase = input.data.minPurchase?.toString() ?? null;
      if (input.data.maxDiscount !== undefined)
        updateData.maxDiscount = input.data.maxDiscount?.toString() ?? null;
      if (input.data.usageLimit !== undefined)
        updateData.usageLimit = input.data.usageLimit;
      if (input.data.startDate !== undefined)
        updateData.startDate = input.data.startDate;
      if (input.data.endDate !== undefined)
        updateData.endDate = input.data.endDate;
      if (input.data.isActive !== undefined)
        updateData.isActive = input.data.isActive;

      const [updatedCoupon] = await ctx.db
        .update(coupons)
        .set(updateData)
        .where(eq(coupons.id, input.id))
        .returning();

      return updatedCoupon;
    }),

  // Delete coupon (admin)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.coupons.findFirst({
        where: eq(coupons.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Coupon not found",
        });
      }

      await ctx.db.delete(coupons).where(eq(coupons.id, input.id));

      return { success: true };
    }),

  // Toggle coupon active status (admin)
  toggleActive: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.coupons.findFirst({
        where: eq(coupons.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Coupon not found",
        });
      }

      const [updated] = await ctx.db
        .update(coupons)
        .set({ isActive: !existing.isActive })
        .where(eq(coupons.id, input.id))
        .returning();

      return updated;
    }),

  // Increment usage count (internal use during order creation)
  incrementUsage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(coupons)
        .set({ usageCount: sql`${coupons.usageCount} + 1` })
        .where(eq(coupons.id, input.id));

      return { success: true };
    }),
});
