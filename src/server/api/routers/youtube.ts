import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import { YOUTUBE_UPLOADS_PLAYLIST_ID } from "@/lib/constants";

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  isShort: boolean;
}

interface CachedData {
  data: YouTubeVideo[];
  timestamp: number;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
let cache: CachedData | null = null;

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

    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return cache.data;
    }

    const videos = await fetchYouTubeVideos();
    cache = { data: videos, timestamp: Date.now() };
    return videos;
  }),
});
