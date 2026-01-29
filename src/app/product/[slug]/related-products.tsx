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
        <h2 className="font-display mb-6 text-2xl text-[#2d1c12]">
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
                <div className="relative aspect-[4/5] overflow-hidden bg-[#f5efe7]">
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
                      <ImageIcon className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  {discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-[#b3474d] text-xs text-white">
                      -{discount}%
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 h-12 font-semibold text-[#2d1c12] group-hover:text-[#b8743a]">
                    {product.name}
                  </h3>
                  <div className="h-5">
                    <p className="text-sm text-[#9c826a]">
                      {product.category?.name}
                    </p>
                  </div>
                  <div className="mt-auto flex items-baseline gap-2 pt-2">
                    <span className="font-semibold text-[#b8743a]">
                      {formatPrice(Number(product.price))}
                    </span>
                    <span className="text-xs text-[#9c826a]">
                      /{product.unit}
                    </span>
                    {product.comparePrice && (
                      <span className="text-sm text-[#9c826a] line-through">
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
