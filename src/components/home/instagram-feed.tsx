"use client";

import Image from "next/image";
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

export function InstagramFeed() {
  const { data: reels, isLoading } = api.instagram.getActive.useQuery(
    undefined,
    { staleTime: 60 * 60 * 1000 },
  );

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
                {reels!.map((reel) => (
                  <CarouselItem
                    key={reel.id}
                    className="basis-[140px] sm:basis-[160px] md:basis-[180px]"
                  >
                    <a
                      href={reel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="relative aspect-[9/16] overflow-hidden">
                        <Image
                          src={reel.thumbnailUrl}
                          alt={reel.title || "Instagram Reel"}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                          <div className="rounded-full bg-white/90 p-3 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            <svg
                              className="text-brand-1 h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                          </div>
                        </div>
                        {/* Instagram badge */}
                        <span className="absolute top-2 left-2 rounded bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          REEL
                        </span>
                      </div>
                      {reel.title && (
                        <div className="p-3">
                          <p className="text-ink-1 line-clamp-2 text-sm font-medium">
                            {reel.title}
                          </p>
                        </div>
                      )}
                    </a>
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
  );
}
