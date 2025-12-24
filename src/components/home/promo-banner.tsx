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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 p-8 text-white md:p-12">
              <div className="relative z-10">
                <span className="mb-2 inline-block rounded-full bg-white/20 px-4 py-1 text-sm">
                  New Arrivals
                </span>
                <h3 className="mb-3 text-2xl font-bold md:text-3xl">
                  Spring Collection
                </h3>
                <p className="mb-6 text-white/80">
                  Discover fresh patterns and vibrant colors for the new season
                </p>
                <Button
                  asChild
                  variant="secondary"
                  className="bg-white text-violet-600 hover:bg-white/90"
                >
                  <Link href="/new-arrivals">Explore Now</Link>
                </Button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -right-10 h-60 w-60 rounded-full bg-white/10" />
              <div className="absolute right-10 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-white/10" />
            </div>
          </SlideInLeft>

          {/* Right Banner - Bulk Orders */}
          <SlideInRight>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white md:p-12">
              <div className="relative z-10">
                <span className="mb-2 inline-block rounded-full bg-white/20 px-4 py-1 text-sm">
                  For Businesses
                </span>
                <h3 className="mb-3 text-2xl font-bold md:text-3xl">
                  Bulk Orders
                </h3>
                <p className="mb-6 text-white/80">
                  Get special discounts on wholesale orders for your business
                </p>
                <Button
                  asChild
                  variant="secondary"
                  className="bg-white text-amber-600 hover:bg-white/90"
                >
                  <Link href="/bulk-orders">Get Quote</Link>
                </Button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white/10" />
              <div className="absolute left-1/2 top-10 h-20 w-20 rounded-full bg-white/10" />
            </div>
          </SlideInRight>
        </div>
      </div>
    </section>
  );
}
