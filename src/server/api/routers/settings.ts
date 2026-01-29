import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const settingsRouter = createTRPCRouter({
  // Get public store settings (no auth required)
  getPublicSettings: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .selectFrom("setting")
      .select(["key", "value"])
      .execute();

    const settingsMap: Record<string, string> = {};
    rows.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });

    return settingsMap;
  }),
});
