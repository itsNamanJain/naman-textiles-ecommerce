"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SlideInLeft, SlideInRight } from "@/components/ui/motion";

export function PromoBanner() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {/* Left Banner - New Arrivals */}
          <SlideInLeft>
            <div className="from-ink-1 via-muted-7 to-muted-5 relative overflow-hidden rounded-3xl bg-gradient-to-r p-8 text-white shadow-[0_30px_70px_rgba(15,23,42,0.35)] md:p-12 lg:p-14">
              <div className="relative z-10">
                <span className="mb-3 inline-block rounded-full bg-white/15 px-5 py-1.5 text-xs font-semibold tracking-[0.15em] uppercase backdrop-blur-sm">
                  New Arrivals
                </span>
                <h3 className="font-display mb-4 text-3xl md:text-4xl">
                  Spring Collection
                </h3>
                <p className="mb-8 max-w-sm text-base text-white/80 md:text-lg">
                  Discover fresh patterns and vibrant colors for the new season
                </p>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="text-ink-1 rounded-full bg-white hover:bg-white/90 shadow-lg"
                >
                  <Link href="/new-arrivals">Explore Now</Link>
                </Button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/8" />
              <div className="absolute -right-10 -bottom-10 h-60 w-60 rounded-full bg-white/8" />
              <div className="absolute top-1/2 right-10 h-20 w-20 -translate-y-1/2 rounded-full bg-white/8" />
            </div>
          </SlideInLeft>

          {/* Right Banner - Bulk Orders */}
          <SlideInRight>
            <div className="from-brand-1 via-sand-5 to-sand-6 relative overflow-hidden rounded-3xl bg-gradient-to-r p-8 text-white shadow-[0_30px_70px_rgba(26,86,219,0.25)] md:p-12 lg:p-14">
              <div className="relative z-10">
                <span className="mb-3 inline-block rounded-full bg-white/15 px-5 py-1.5 text-xs font-semibold tracking-[0.15em] uppercase backdrop-blur-sm">
                  For Businesses
                </span>
                <h3 className="font-display mb-4 text-3xl md:text-4xl">
                  Bulk Orders
                </h3>
                <p className="mb-8 max-w-sm text-base text-white/90 md:text-lg">
                  Get special discounts on wholesale orders for your business
                </p>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="text-muted-5 rounded-full bg-white hover:bg-white/90 shadow-lg"
                >
                  <Link href="/bulk-orders">Get Quote</Link>
                </Button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/8" />
              <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white/8" />
              <div className="absolute top-10 left-1/2 h-20 w-20 rounded-full bg-white/8" />
            </div>
          </SlideInRight>
        </div>
      </div>
    </section>
  );
}
