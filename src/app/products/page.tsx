import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { Metadata } from "next";

import { ProductFilters, ProductGrid } from "@/components/products";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "All Products - Naman Textiles",
  description:
    "Browse our complete collection of premium fabrics. Cotton, Rayon, Silk, and more at Naman Textiles, Gandhi Nagar, Delhi.",
};

type Props = {
  searchParams: Promise<{
    sort?: string;
    mode?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const {
    sort = "newest",
    mode,
    minPrice,
    maxPrice,
    search,
  } = await searchParams;

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
              className="text-muted-2 hover:text-brand-1 flex items-center"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="text-muted-3 h-4 w-4" />
            <span className="text-ink-1 font-medium">All Products</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-page-wash py-10">
        <div className="animate-fade-in-up container mx-auto px-4">
          <h1 className="font-display text-ink-1 text-3xl md:text-4xl">
            {search ? `Search Results for "${search}"` : "All Products"}
          </h1>
          <p className="text-muted-1 mt-2 text-sm md:text-base">
            Explore our complete collection of premium fabrics
          </p>
        </div>
      </div>

      {/* Filters and Products */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Suspense
            fallback={<Skeleton className="h-10 w-full sm:w-[300px]" />}
          >
            <ProductFilters />
          </Suspense>
        </div>

        {/* Products Grid */}
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid
            sortBy={sortBy}
            sellingMode={sellingMode}
            search={search}
            minPrice={minPrice ? parseFloat(minPrice) : undefined}
            maxPrice={maxPrice ? parseFloat(maxPrice) : undefined}
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
