"use client";

import { useEffect, useRef } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FadeInView } from "@/components/ui/motion";
import { api } from "@/trpc/react";
import { STORE_INFO } from "@/lib/constants";

function extractReelCode(url: string): string | null {
  const match = url.match(/\/(?:reel|reels)\/([A-Za-z0-9_-]+)/);
  return match?.[1] ?? null;
}

export function InstagramFeed() {
  const { data: reels, isLoading } = api.instagram.getAll.useQuery(undefined, {
    staleTime: 60 * 60 * 1000,
  });
  const embedScriptLoaded = useRef(false);

  useEffect(() => {
    if (!reels || reels.length === 0 || embedScriptLoaded.current) return;
    embedScriptLoaded.current = true;
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
      embedScriptLoaded.current = false;
    };
  }, [reels]);

  useEffect(() => {
    if (reels && reels.length > 0 && typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).instgrm?.Embeds?.process();
    }
  }, [reels]);

  if (!isLoading && (!reels || reels.length === 0)) return null;

  return (
    <section className="bg-paper-3 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <FadeInView className="mb-10 flex flex-col items-center justify-between gap-4 md:mb-14 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="font-display text-ink-0 mb-3 text-3xl md:text-4xl lg:text-5xl">
              Follow Us on Instagram
            </h2>
            <p className="text-muted-1 text-base md:text-lg">
              Catch our latest reels and behind-the-scenes content
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="text-ink-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
          >
            <a
              href={STORE_INFO.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Profile <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </FadeInView>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-brand-1 h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="px-10">
            <Carousel
              opts={{ align: "start", dragFree: true }}
              className="w-full"
            >
              <CarouselContent>
                {reels!.map((reel) => {
                  const code = extractReelCode(reel.url);
                  if (!code) return null;

                  return (
                    <CarouselItem
                      key={reel.id}
                      className="basis-[280px] sm:basis-[320px] md:basis-[360px]"
                    >
                      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <blockquote
                          className="instagram-media"
                          data-instgrm-captioned
                          data-instgrm-permalink={`https://www.instagram.com/reel/${code}/`}
                          style={{
                            background: "#FFF",
                            border: 0,
                            margin: 0,
                            padding: 0,
                            width: "100%",
                            maxWidth: "100%",
                          }}
                        />
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden border-none bg-white/80 shadow-sm hover:bg-white md:flex" />
              <CarouselNext className="hidden border-none bg-white/80 shadow-sm hover:bg-white md:flex" />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
}
