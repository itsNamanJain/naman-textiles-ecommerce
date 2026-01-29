import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Home, Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { ProductFilters, ProductGrid } from "@/components/products";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "New Arrivals - Naman Textiles",
  description:
    "Discover our latest fabric collections. Fresh patterns, vibrant colors, and premium quality textiles just arrived at Naman Textiles.",
};

type Props = {
  searchParams: Promise<{
    sort?: string;
    mode?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

export default async function NewArrivalsPage({ searchParams }: Props) {
  const { sort = "newest", mode, minPrice, maxPrice } = await searchParams;

  const sortBy = (
    ["newest", "oldest", "price-asc", "price-desc", "name"].includes(sort)
      ? sort
      : "newest"
  ) as "newest" | "oldest" | "price-asc" | "price-desc" | "name";

  const sellingMode = mode === "meter" || mode === "piece" ? mode : undefined;

  return (
    <div className="min-h-screen bg-transparent">
      {/* Breadcrumb */}
      <div className="border-b border-black/5 bg-white/70">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center text-[#9c826a] hover:text-[#b8743a]"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-[#2d1c12]">New Arrivals</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-[radial-gradient(circle_at_top,rgba(255,248,238,0.9),rgba(255,255,255,0.7)),linear-gradient(120deg,#2d1c12,#6b3f24,#b8743a)] py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-white/20 p-3">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl">New Arrivals</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 md:text-base">
            Discover our latest fabric collections. Fresh patterns, vibrant
            colors, and premium quality textiles just for you.
          </p>
        </div>
      </div>

      {/* Filters and Products */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Suspense fallback={<Skeleton className="h-10 w-[300px]" />}>
            <ProductFilters />
          </Suspense>
        </div>

        {/* Products Grid - new arrivals (last 30 days, excludes featured) */}
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid
            sortBy={sortBy}
            sellingMode={sellingMode}
            minPrice={minPrice ? parseFloat(minPrice) : undefined}
            maxPrice={maxPrice ? parseFloat(maxPrice) : undefined}
            newArrivals
          />
        </Suspense>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-black/5 bg-white/80 shadow-[0_10px_30px_rgba(15,15,15,0.06)]"
        >
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}
