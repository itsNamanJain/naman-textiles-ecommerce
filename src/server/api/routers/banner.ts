import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const bannerRouter = createTRPCRouter({
  // Get all active banners (checks date range too)
  getActive: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();

    return ctx.db
      .selectFrom("banner")
      .selectAll()
      .where("isActive", "=", true)
      .where((eb) =>
        eb.or([
          eb("startDate", "is", null),
          eb("startDate", "<=", now),
        ])
      )
      .where((eb) =>
        eb.or([eb("endDate", "is", null), eb("endDate", ">=", now)])
      )
      .orderBy("position", "asc")
      .execute();
  }),

  // Get all banners (for admin)
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .selectFrom("banner")
      .selectAll()
      .orderBy("position", "asc")
      .execute();
  }),
});
