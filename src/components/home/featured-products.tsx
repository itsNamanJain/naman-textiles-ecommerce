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
    <section className="bg-paper-4 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <FadeInView className="mb-10 flex flex-col items-center justify-between gap-4 md:mb-14 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="font-display text-ink-0 mb-3 text-3xl md:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="text-muted-1 text-base md:text-lg">{subtitle}</p>
          </div>
          <Button
            variant="outline"
            asChild
            className="text-ink-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
          >
            <Link href="/products">View All Products</Link>
          </Button>
        </FadeInView>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-brand-1 h-8 w-8 animate-spin" />
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-muted-2 py-12 text-center">
            No featured products available
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
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
