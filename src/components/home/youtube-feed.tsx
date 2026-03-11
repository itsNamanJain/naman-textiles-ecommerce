"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Play, ExternalLink, X } from "lucide-react";
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

export function YouTubeFeed() {
  const { data: videos, isLoading } = api.youtube.getLatestVideos.useQuery(
    undefined,
    { staleTime: 60 * 60 * 1000 },
  );
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeIsShort, setActiveIsShort] = useState(false);

  if (!isLoading && (!videos || videos.length === 0)) return null;

  return (
    <>
      <section className="bg-paper-4 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <FadeInView className="mb-10 flex flex-col items-center justify-between gap-4 md:mb-14 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="font-display text-ink-0 mb-3 text-3xl md:text-4xl lg:text-5xl">
                From Our Studio
              </h2>
              <p className="text-muted-1 text-base md:text-lg">
                Watch our latest fabric showcases and styling tips
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              className="text-ink-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
            >
              <a
                href={STORE_INFO.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Channel <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </FadeInView>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-brand-1 h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="px-2 md:px-10">
              <Carousel
                opts={{ align: "start", loop: true, dragFree: true }}
                className="w-full"
              >
                <CarouselContent>
                  {videos!.map((video) => (
                    <CarouselItem
                      key={video.id}
                      className={
                        video.isShort
                          ? "basis-[140px] sm:basis-[160px] md:basis-[180px]"
                          : "basis-[280px] sm:basis-[320px] md:basis-[360px]"
                      }
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActiveVideoId(video.id);
                          setActiveIsShort(video.isShort);
                        }}
                        className="group block w-full overflow-hidden rounded-xl bg-white text-left shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div
                          className={`relative overflow-hidden ${
                            video.isShort ? "aspect-[9/16]" : "aspect-video"
                          }`}
                        >
                          <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                            <div className="rounded-full bg-white/90 p-3 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                              <Play className="text-brand-1 h-5 w-5 fill-current" />
                            </div>
                          </div>
                          {video.isShort && (
                            <span className="absolute top-2 left-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              SHORT
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-ink-1 line-clamp-2 text-sm font-medium">
                            {video.title}
                          </p>
                        </div>
                      </button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden border-none bg-white/80 shadow-sm hover:bg-white md:flex" />
                <CarouselNext className="hidden border-none bg-white/80 shadow-sm hover:bg-white md:flex" />
              </Carousel>
            </div>
          )}
        </div>
      </section>

      {/* Video Player Modal */}
      {activeVideoId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveVideoId(null)}
        >
          <div
            className={`relative w-full ${
              activeIsShort ? "max-w-sm" : "max-w-4xl"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveVideoId(null)}
              className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
            <div
              className={`overflow-hidden rounded-xl ${
                activeIsShort ? "aspect-[9/16]" : "aspect-video"
              }`}
            >
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
