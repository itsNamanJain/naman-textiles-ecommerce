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
                  <div className="bg-hero-wash absolute inset-0" />
                )}

                {/* Overlay for images */}
                {banner.image && (
                  <div className="absolute inset-0 bg-black/35" />
                )}

                {/* Decorative circles (only for non-image banners) */}
                {!banner.image && (
                  <>
                    <div className="bg-sand-2/40 absolute -top-24 -right-28 h-96 w-96 rounded-full blur-3xl" />
                    <div className="bg-sand-3/40 absolute -bottom-28 -left-28 h-72 w-72 rounded-full blur-3xl" />
                    <div className="bg-sand-4/50 absolute top-1/4 right-1/4 h-40 w-40 rounded-full blur-2xl" />
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
                        <span className="bg-brand-1 mb-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-white uppercase">
                          <Sparkles className="h-3.5 w-3.5" />
                          {banner.tag}
                        </span>
                      )}
                      <h1
                        className={`font-display mb-4 text-4xl leading-tight sm:text-5xl lg:text-6xl ${
                          banner.image ? "text-white" : "text-ink-1"
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
                            banner.image ? "text-white/90" : "text-ink-2"
                          }`}
                        >
                          {banner.subtitle}
                        </p>
                      )}
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                        <Button
                          asChild
                          size="lg"
                          className="bg-brand-1 hover:bg-brand-2 rounded-full"
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
                          className="text-ink-1 rounded-full border-black/10 bg-white/70 hover:bg-white"
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
                            <div className="from-paper-12 to-paper-11 absolute -top-4 -left-4 h-48 w-48 rotate-[-8deg] rounded-2xl bg-gradient-to-br shadow-lg lg:h-56 lg:w-56" />
                            <div className="from-sand-2 to-paper-13 absolute -top-2 -right-4 h-48 w-48 rotate-[5deg] rounded-2xl bg-gradient-to-br shadow-lg lg:h-56 lg:w-56" />
                            <div className="from-paper-10 to-paper-14 relative h-52 w-52 rounded-2xl bg-gradient-to-br shadow-xl lg:h-64 lg:w-64">
                              <div className="border-brand-1/40 absolute inset-4 rounded-xl border-2 border-dashed" />
                              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                                <span className="text-brand-1 text-4xl font-semibold lg:text-5xl">
                                  500+
                                </span>
                                <span className="text-brand-3 mt-1 text-sm font-medium">
                                  Fabric Varieties
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="absolute top-1/2 -left-8 rounded-full bg-white px-4 py-2 shadow-lg">
                            <span className="text-ink-1 text-sm font-semibold">
                              100% Quality
                            </span>
                          </div>
                          <div className="absolute -right-4 bottom-4 rounded-full bg-white px-4 py-2 shadow-lg">
                            <span className="text-ink-1 text-sm font-semibold">
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
            className={`hover:bg-brand-1 h-2 w-2 rounded-full transition-all ${
              currentSlide === index ? "bg-brand-1 w-7" : "bg-warm-6"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
