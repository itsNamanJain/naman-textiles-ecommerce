"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FadeInView,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";
import { api } from "@/trpc/react";
import { ProductCard } from "@/components/products/product-card";

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
}

export function FeaturedProducts({
  title = "Featured Products",
  subtitle = "Handpicked fabrics for you",
}: FeaturedProductsProps) {
  const { data: products, isLoading } = api.product.getFeatured.useQuery({
    limit: 8,
  });

  return (
    <section className="bg-[#f8f1e7] py-12 md:py-16">
      <div className="container mx-auto px-4">
        <FadeInView className="mb-8 flex flex-col items-center justify-between gap-4 md:mb-12 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="font-display mb-2 text-2xl text-[#2d1c12] md:text-3xl lg:text-4xl">
              {title}
            </h2>
            <p className="text-sm text-[#6b5645] md:text-base">{subtitle}</p>
          </div>
          <Button
            variant="outline"
            asChild
            className="rounded-full border-black/10 bg-white/80 text-[#2d1c12] hover:bg-white"
          >
            <Link href="/products">View All Products</Link>
          </Button>
        </FadeInView>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : !products || products.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No featured products available
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard
                  product={{
                    ...product,
                    images: product.images.map((img) => ({
                      url: img.url,
                      alt: img.alt,
                    })),
                  }}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
