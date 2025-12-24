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
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center text-gray-500 hover:text-amber-600"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">New Arrivals</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-white/20 p-3">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">New Arrivals</h1>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Discover our latest fabric collections. Fresh patterns, vibrant
            colors, and premium quality textiles just for you.
          </p>
        </div>
      </div>

      {/* Filters and Products */}
      <div className="container mx-auto px-4 py-6">
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
        <div key={i} className="overflow-hidden rounded-lg bg-white shadow-sm">
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
