import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { Metadata } from "next";

import { api } from "@/trpc/server";
import { ProductFilters, ProductGrid } from "@/components/products";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    mode?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await api.category.getBySlug({ slug });

  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${category.name} - Naman Textiles`,
    description:
      category.description ??
      `Shop premium ${category.name} fabrics at Naman Textiles. Quality textiles from Gandhi Nagar, Delhi.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort = "newest", mode, minPrice, maxPrice } = await searchParams;

  const category = await api.category.getBySlug({ slug });

  if (!category) {
    notFound();
  }

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
            <Link
              href="/products"
              className="text-[#9c826a] hover:text-[#b8743a]"
            >
              Products
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-[#2d1c12]">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-[radial-gradient(circle_at_top,rgba(255,248,238,0.9),rgba(255,255,255,0.7)),linear-gradient(120deg,#fff5e6,#f4e7d8,#fff2dd)] py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl text-[#2d1c12] md:text-4xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-2 max-w-2xl text-sm text-[#6b5645] md:text-base">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Filters and Products */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Suspense fallback={<Skeleton className="h-10 w-[300px]" />}>
            <ProductFilters categorySlug={slug} />
          </Suspense>
        </div>

        {/* Products Grid */}
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid
            categorySlug={slug}
            sortBy={sortBy}
            sellingMode={sellingMode}
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
