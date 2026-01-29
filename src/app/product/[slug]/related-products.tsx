"use client";

import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { api } from "@/trpc/react";

interface RelatedProductsProps {
  productId: string;
  categoryId: string;
}

export function RelatedProducts({
  productId,
  categoryId,
}: RelatedProductsProps) {
  const { data: products, isLoading } = api.product.getRelated.useQuery({
    productId,
    categoryId,
    limit: 4,
  });

  if (isLoading || !products || products.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <FadeIn>
        <h2 className="font-display text-ink-1 mb-6 text-2xl">
          You May Also Like
        </h2>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => {
          const discount = product.comparePrice
            ? Math.round(
                ((Number(product.comparePrice) - Number(product.price)) /
                  Number(product.comparePrice)) *
                  100
              )
            : 0;

          return (
            <StaggerItem key={product.id} className="h-full">
              <Link
                href={`/product/${product.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white/90 shadow-[0_10px_30px_rgba(15,15,15,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(15,15,15,0.12)]"
              >
                {/* Image */}
                <div className="bg-paper-2 relative aspect-[4/5] overflow-hidden">
                  {product.images[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt ?? product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-3" />
                    </div>
                  )}
                  {discount > 0 && (
                    <Badge className="bg-danger-1 absolute top-2 left-2 text-xs text-white">
                      -{discount}%
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-ink-1 group-hover:text-brand-1 line-clamp-2 h-12 font-semibold">
                    {product.name}
                  </h3>
                  <div className="h-5">
                    <p className="text-muted-2 text-sm">
                      {product.category?.name}
                    </p>
                  </div>
                  <div className="mt-auto flex items-baseline gap-2 pt-2">
                    <span className="text-brand-1 font-semibold">
                      {formatPrice(Number(product.price))}
                    </span>
                    <span className="text-muted-2 text-xs">
                      /{product.unit}
                    </span>
                    {product.comparePrice && (
                      <span className="text-muted-2 text-sm line-through">
                        {formatPrice(Number(product.comparePrice))}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
}
