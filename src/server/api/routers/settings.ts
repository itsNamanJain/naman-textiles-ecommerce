import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const settingsRouter = createTRPCRouter({
  // Get public store settings (no auth required)
  getPublicSettings: publicProcedure.query(async ({ ctx }) => {
    const allSettings = await ctx.db.query.settings.findMany();

    // Convert to key-value object
    const settingsMap: Record<string, string> = {};
    allSettings.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });

    return settingsMap;
  }),
});
