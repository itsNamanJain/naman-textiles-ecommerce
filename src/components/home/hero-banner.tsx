"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { FadeIn } from "@/components/ui/motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { api } from "@/trpc/react";

// Typewriter component for animated text
function TypewriterText({
  text,
  className,
  isActive,
}: {
  text: string;
  className?: string;
  isActive: boolean;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }

    setDisplayedText("");
    setIsTyping(true);
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 50); // Speed of typing (50ms per character)

    return () => clearInterval(typingInterval);
  }, [text, isActive]);

  return (
    <span className={className}>
      {displayedText}
      {isTyping && (
        <span className="ml-0.5 inline-block h-[1em] w-[3px] animate-pulse bg-current align-middle" />
      )}
    </span>
  );
}

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  link: string;
  tag?: string;
}

// Fallback static banners if database is empty
const staticBanners: Banner[] = [
  {
    id: "static-1",
    title: "Crafted Textiles for Modern Indian Fashion",
    subtitle:
      "Premium cottons, brocades, and velvets curated for designers and boutiques.",
    image: null,
    link: "/products",
    tag: "Editor's Pick",
  },
  {
    id: "static-2",
    title: "New Season. New Textures.",
    subtitle: "Fresh weaves and rare blends - now in stock.",
    image: null,
    link: "/products",
    tag: "New Drop",
  },
  {
    id: "static-3",
    title: "Wholesale-Ready, Retail-Beautiful",
    subtitle: "Explore the full collection with reliable supply.",
    image: null,
    link: "/products",
    tag: "B2B Friendly",
  },
];

const AUTOPLAY_INTERVAL = 7500; // 7.5 seconds between slides

export function HeroBanner() {
  const { data: dbBanners } = api.banner.getActive.useQuery();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Use DB banners if available, otherwise use static banners
  const banners: Banner[] =
    dbBanners && dbBanners.length > 0
      ? dbBanners.map((b, index) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          image: b.image,
          link: b.link ?? "/products",
          tag: index === 0 ? "Featured" : index === 1 ? "Popular" : "New",
        }))
      : staticBanners;

  // Handle slide changes
  const onSelect = useCallback(() => {
    if (!carouselApi) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
  }, [carouselApi]);

  // Set up slide change listener
  useEffect(() => {
    if (!carouselApi) return;
    onSelect();
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi, onSelect]);

  // Auto-play functionality
  useEffect(() => {
    if (!carouselApi) return;

    const autoplayInterval = setInterval(() => {
      carouselApi.scrollNext();
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(autoplayInterval);
  }, [carouselApi]);

  // Navigate to specific slide
  const goToSlide = useCallback(
    (index: number) => {
      carouselApi?.scrollTo(index);
    },
    [carouselApi]
  );

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(184,116,58,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,210,160,0.2),transparent_40%)]" />
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={setCarouselApi}
        className="w-full"
      >
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id}>
              <div className="relative h-[430px] w-full overflow-hidden sm:h-[480px] md:h-[560px]">
                {/* Background Image or Gradient */}
                {banner.image ? (
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,248,238,1),rgba(255,255,255,0.8)),linear-gradient(120deg,#fff5e6,#f4e7d8,#fff2dd)]" />
                )}

                {/* Overlay for images */}
                {banner.image && (
                  <div className="absolute inset-0 bg-black/35" />
                )}

                {/* Decorative circles (only for non-image banners) */}
                {!banner.image && (
                  <>
                    <div className="absolute -top-24 -right-28 h-96 w-96 rounded-full bg-[#f2cf9d]/40 blur-3xl" />
                    <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-[#d8b28c]/40 blur-3xl" />
                    <div className="absolute top-1/4 right-1/4 h-40 w-40 rounded-full bg-[#f7e5cd]/50 blur-2xl" />
                  </>
                )}

                {/* Content */}
                <div className="relative container mx-auto flex h-full items-center px-4">
                  <div className="grid w-full items-center gap-8 md:grid-cols-2">
                    {/* Text Content */}
                    <FadeIn
                      delay={index * 0.1}
                      className="text-center md:text-left"
                    >
                      {banner.tag && (
                        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#b8743a] px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-white uppercase">
                          <Sparkles className="h-3.5 w-3.5" />
                          {banner.tag}
                        </span>
                      )}
                      <h1
                        className={`font-display mb-4 text-4xl leading-tight sm:text-5xl lg:text-6xl ${
                          banner.image ? "text-white" : "text-[#2d1c12]"
                        }`}
                      >
                        <TypewriterText
                          text={banner.title}
                          isActive={currentSlide === index}
                        />
                      </h1>
                      {banner.subtitle && (
                        <p
                          className={`mb-8 text-base leading-relaxed sm:text-lg ${
                            banner.image ? "text-white/90" : "text-[#5c4a3d]"
                          }`}
                        >
                          {banner.subtitle}
                        </p>
                      )}
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                        <Button
                          asChild
                          size="lg"
                          className="rounded-full bg-[#b8743a] hover:bg-[#a4632f]"
                        >
                          <Link href={banner.link}>
                            Shop Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          asChild
                          size="lg"
                          className="rounded-full border-black/10 bg-white/70 text-[#2d1c12] hover:bg-white"
                        >
                          <Link href="/products">View Collection</Link>
                        </Button>
                      </div>
                    </FadeIn>

                    {/* Right side - Decorative (only for non-image banners) */}
                    {!banner.image && (
                      <div className="hidden md:block">
                        <div className="relative">
                          <div className="relative mx-auto w-fit">
                            <div className="absolute -top-4 -left-4 h-48 w-48 rotate-[-8deg] rounded-2xl bg-gradient-to-br from-[#e8c4a0] to-[#f4d9bf] shadow-lg lg:h-56 lg:w-56" />
                            <div className="absolute -top-2 -right-4 h-48 w-48 rotate-[5deg] rounded-2xl bg-gradient-to-br from-[#f2cf9d] to-[#f7e2c8] shadow-lg lg:h-56 lg:w-56" />
                            <div className="relative h-52 w-52 rounded-2xl bg-gradient-to-br from-[#fdf6ee] to-[#f2dfc6] shadow-xl lg:h-64 lg:w-64">
                              <div className="absolute inset-4 rounded-xl border-2 border-dashed border-[#b8743a]/40" />
                              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                                <span className="text-4xl font-semibold text-[#b8743a] lg:text-5xl">
                                  500+
                                </span>
                                <span className="mt-1 text-sm font-medium text-[#8a6642]">
                                  Fabric Varieties
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="absolute top-1/2 -left-8 rounded-full bg-white px-4 py-2 shadow-lg">
                            <span className="text-sm font-semibold text-[#2d1c12]">
                              100% Quality
                            </span>
                          </div>
                          <div className="absolute -right-4 bottom-4 rounded-full bg-white px-4 py-2 shadow-lg">
                            <span className="text-sm font-semibold text-[#2d1c12]">
                              Best Prices
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 hidden border-none bg-white/80 shadow-sm hover:bg-white md:flex" />
        <CarouselNext className="right-4 hidden border-none bg-white/80 shadow-sm hover:bg-white md:flex" />
      </Carousel>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 rounded-full transition-all hover:bg-[#b8743a] ${
              currentSlide === index ? "w-7 bg-[#b8743a]" : "bg-[#e2c7ab]"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
