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
  title: string;
  thumbnailUrl: string;
  position: number;
  isActive: boolean;
}

async function getAllReels(): Promise<InstagramReel[]> {
  const data = await redis.get<InstagramReel[]>(REDIS_KEY);
  return data ?? [];
}

async function saveAllReels(reels: InstagramReel[]): Promise<void> {
  await redis.set(REDIS_KEY, reels);
}

const reelInputSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  title: z.string().default(""),
  thumbnailUrl: z.string().url("Please enter a valid thumbnail URL"),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const instagramRouter = createTRPCRouter({
  getActive: publicProcedure.query(async () => {
    const reels = await getAllReels();
    return reels
      .filter((r) => r.isActive)
      .sort((a, b) => a.position - b.position);
  }),

  getAll: adminProcedure.query(async () => {
    const reels = await getAllReels();
    return reels.sort((a, b) => a.position - b.position);
  }),

  create: adminProcedure
    .input(reelInputSchema)
    .mutation(async ({ input }) => {
      const reels = await getAllReels();
      const newReel: InstagramReel = {
        id: randomUUID(),
        url: input.url,
        title: input.title,
        thumbnailUrl: input.thumbnailUrl,
        position: input.position,
        isActive: input.isActive,
      };
      reels.push(newReel);
      await saveAllReels(reels);
      return newReel;
    }),

  update: adminProcedure
    .input(reelInputSchema.extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      const reels = await getAllReels();
      const index = reels.findIndex((r) => r.id === input.id);
      if (index === -1) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reel not found",
        });
      }
      reels[index] = {
        id: input.id,
        url: input.url,
        title: input.title,
        thumbnailUrl: input.thumbnailUrl,
        position: input.position,
        isActive: input.isActive,
      };
      await saveAllReels(reels);
      return reels[index];
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const reels = await getAllReels();
      const filtered = reels.filter((r) => r.id !== input.id);
      await saveAllReels(filtered);
      return { success: true };
    }),
});
