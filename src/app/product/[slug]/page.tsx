import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { api } from "@/trpc/server";
import { ProductDetails } from "./product-details";
import { RelatedProducts } from "./related-products";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await api.product.getBySlug({ slug });

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} - Naman Textiles`,
    description:
      product.metaDescription ??
      product.shortDescription ??
      `Buy ${product.name} at best price. Quality fabric from Naman Textiles, Gandhi Nagar, Delhi.`,
    openGraph: {
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await api.product.getBySlug({ slug });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-transparent pb-12">
      {/* Product Details */}
      <Suspense fallback={<ProductDetailsSkeleton />}>
        <ProductDetails product={product} />
      </Suspense>

      {/* Related Products */}
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts
          productId={product.id}
          categoryId={product.categoryId}
        />
      </Suspense>
    </div>
  );
}

function ProductDetailsSkeleton() {
  return (
    <div className="bg-transparent">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-40 rounded-full" />
              <Skeleton className="h-12 flex-1 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RelatedProductsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-black/5 bg-white/80 shadow-[0_10px_30px_rgba(15,15,15,0.06)]"
          >
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
