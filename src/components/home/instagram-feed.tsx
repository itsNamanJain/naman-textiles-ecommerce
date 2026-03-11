"use client";

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
                      className="basis-[260px] sm:basis-[300px] md:basis-[340px]"
                    >
                      {/* Outer container clips to show only the video portion.
                          The iframe is shifted up to hide the profile header
                          and made taller to push the bottom UI out of view. */}
                      <div className="relative aspect-[9/16] overflow-hidden bg-black">
                        <iframe
                          src={`https://www.instagram.com/reel/${code}/embed/`}
                          title="Instagram Reel"
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                          allowFullScreen
                          scrolling="no"
                          className="absolute border-0"
                          style={{
                            width: "100%",
                            height: "180%",
                            top: "-64px",
                            left: 0,
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
