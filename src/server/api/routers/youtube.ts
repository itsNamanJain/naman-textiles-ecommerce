import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import { redis } from "@/server/redis";
import { YOUTUBE_UPLOADS_PLAYLIST_ID } from "@/lib/constants";

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  isShort: boolean;
}

const CACHE_KEY = "youtube:latest-videos";
const CACHE_TTL = 12 * 60 * 60; // 12 hours in seconds

async function fetchYouTubeVideos(): Promise<YouTubeVideo[]> {
  const apiKey = env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${YOUTUBE_UPLOADS_PLAYLIST_ID}&maxResults=5&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("[YouTube] API error:", res.status, await res.text());
    return [];
  }

  const data = (await res.json()) as {
    items: Array<{
      snippet: {
        title: string;
        resourceId: { videoId: string };
        thumbnails: Record<string, { url: string } | undefined>;
        publishedAt: string;
      };
    }>;
  };

  return (data.items ?? []).map((item) => {
    const snippet = item.snippet;
    const title = snippet.title ?? "";
    const isShort =
      title.toLowerCase().includes("#short") ||
      title.toLowerCase().includes("#shorts");

    return {
      id: snippet.resourceId.videoId,
      title,
      thumbnailUrl:
        snippet.thumbnails.high?.url ??
        snippet.thumbnails.default?.url ??
        "",
      publishedAt: snippet.publishedAt,
      isShort,
    };
  });
}

export const youtubeRouter = createTRPCRouter({
  getLatestVideos: publicProcedure.query(async () => {
    if (!env.YOUTUBE_API_KEY) return [];

    // Try Redis cache first
    if (redis) {
      try {
        const cached = await redis.get<YouTubeVideo[]>(CACHE_KEY);
        if (cached) return cached;
      } catch (e) {
        console.error("[YouTube] Redis read error:", e);
      }
    }

    const videos = await fetchYouTubeVideos();

    // Store in Redis with 12-hour TTL
    if (redis && videos.length > 0) {
      redis.set(CACHE_KEY, videos, { ex: CACHE_TTL }).catch((e) => {
        console.error("[YouTube] Redis write error:", e);
      });
    }

    return videos;
  }),
});
