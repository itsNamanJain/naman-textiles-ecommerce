"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { api } from "@/trpc/react";

type ProductGridProps = {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "newest" | "oldest" | "price-asc" | "price-desc" | "name";
  sellingMode?: "meter" | "piece";
  featured?: boolean;
  newArrivals?: boolean;
};

export function ProductGrid({
  categorySlug,
  search,
  minPrice,
  maxPrice,
  sortBy = "newest",
  sellingMode,
  featured,
  newArrivals,
}: ProductGridProps) {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = api.product.getAll.useInfiniteQuery(
    {
      limit: 12,
      categorySlug,
      search,
      minPrice,
      maxPrice,
      sortBy,
      sellingMode,
      featured,
      newArrivals,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-[#2d1c12]">
          Something went wrong
        </p>
        <p className="mt-1 text-sm text-[#6b5645]">
          Failed to load products. Please try again later.
        </p>
      </div>
    );
  }

  const products = data?.pages.flatMap((page) => page.items) ?? [];

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-[#2d1c12]">No products found</p>
        <p className="mt-1 text-sm text-[#6b5645]">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <>
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <StaggerItem key={product.id}>
            <ProductCard product={product} />
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Infinite scroll trigger */}
      <div ref={ref} className="flex justify-center py-8">
        {isFetchingNextPage && (
          <Loader2 className="h-6 w-6 animate-spin text-[#b8743a]" />
        )}
        {!hasNextPage && products.length > 0 && (
          <p className="text-sm text-[#9c826a]">No more products to load</p>
        )}
      </div>
    </>
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
