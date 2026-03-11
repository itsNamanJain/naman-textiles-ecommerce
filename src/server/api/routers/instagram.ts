import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";

import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { redis } from "@/server/redis";

const REDIS_KEY = "instagram:reels";

interface InstagramReel {
  id: string;
  url: string;
}

async function getAllReels(): Promise<InstagramReel[]> {
  const data = await redis.get<InstagramReel[]>(REDIS_KEY);
  return data ?? [];
}

async function saveAllReels(reels: InstagramReel[]): Promise<void> {
  await redis.set(REDIS_KEY, reels);
}

export const instagramRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return getAllReels();
  }),

  create: adminProcedure
    .input(z.object({ url: z.string().url("Please enter a valid URL") }))
    .mutation(async ({ input }) => {
      const reels = await getAllReels();
      const newReel: InstagramReel = {
        id: randomUUID(),
        url: input.url,
      };
      reels.push(newReel);
      await saveAllReels(reels);
      return newReel;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const reels = await getAllReels();
      const filtered = reels.filter((r) => r.id !== input.id);
      if (filtered.length === reels.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reel not found",
        });
      }
      await saveAllReels(filtered);
      return { success: true };
    }),
});
