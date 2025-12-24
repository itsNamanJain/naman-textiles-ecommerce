import { eq, asc, and, lte, gte, or, isNull } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { banners } from "@/server/db/schema";

export const bannerRouter = createTRPCRouter({
  // Get all active banners (checks date range too)
  getActive: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();

    return ctx.db.query.banners.findMany({
      where: and(
        eq(banners.isActive, true),
        or(isNull(banners.startDate), lte(banners.startDate, now)),
        or(isNull(banners.endDate), gte(banners.endDate, now))
      ),
      orderBy: [asc(banners.position)],
    });
  }),

  // Get all banners (for admin)
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.banners.findMany({
      orderBy: [asc(banners.position)],
    });
  }),
});
