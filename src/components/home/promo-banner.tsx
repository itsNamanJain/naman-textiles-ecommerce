"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SlideInLeft, SlideInRight } from "@/components/ui/motion";

export function PromoBanner() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Banner - New Arrivals */}
          <SlideInLeft>
            <div className="from-ink-1 via-muted-7 to-muted-5 relative overflow-hidden rounded-3xl bg-gradient-to-r p-8 text-white shadow-[0_30px_70px_rgba(29,18,12,0.35)] md:p-12">
              <div className="relative z-10">
                <span className="mb-2 inline-block rounded-full bg-white/20 px-4 py-1 text-xs tracking-[0.2em] uppercase">
                  New Arrivals
                </span>
                <h3 className="font-display mb-3 text-2xl md:text-3xl">
                  Spring Collection
                </h3>
                <p className="mb-6 text-sm text-white/80 md:text-base">
                  Discover fresh patterns and vibrant colors for the new season
                </p>
                <Button
                  asChild
                  variant="secondary"
                  className="text-ink-1 rounded-full bg-white hover:bg-white/90"
                >
                  <Link href="/new-arrivals">Explore Now</Link>
                </Button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -right-10 -bottom-10 h-60 w-60 rounded-full bg-white/10" />
              <div className="absolute top-1/2 right-10 h-20 w-20 -translate-y-1/2 rounded-full bg-white/10" />
            </div>
          </SlideInLeft>

          {/* Right Banner - Bulk Orders */}
          <SlideInRight>
            <div className="from-brand-1 via-sand-5 to-sand-6 relative overflow-hidden rounded-3xl bg-gradient-to-r p-8 text-white shadow-[0_30px_70px_rgba(184,116,58,0.25)] md:p-12">
              <div className="relative z-10">
                <span className="mb-2 inline-block rounded-full bg-white/20 px-4 py-1 text-xs tracking-[0.2em] uppercase">
                  For Businesses
                </span>
                <h3 className="font-display mb-3 text-2xl md:text-3xl">
                  Bulk Orders
                </h3>
                <p className="mb-6 text-sm text-white/90 md:text-base">
                  Get special discounts on wholesale orders for your business
                </p>
                <Button
                  asChild
                  variant="secondary"
                  className="text-muted-5 rounded-full bg-white hover:bg-white/90"
                >
                  <Link href="/bulk-orders">Get Quote</Link>
                </Button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white/10" />
              <div className="absolute top-10 left-1/2 h-20 w-20 rounded-full bg-white/10" />
            </div>
          </SlideInRight>
        </div>
      </div>
    </section>
  );
}
