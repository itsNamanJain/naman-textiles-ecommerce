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

export function RelatedProducts({ productId, categoryId }: RelatedProductsProps) {
  const { data: products, isLoading } = api.product.getRelated.useQuery({
    productId,
    categoryId,
    limit: 4,
  });

  if (isLoading || !products || products.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <FadeIn>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
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
                className="group flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
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
                    <Badge className="absolute left-2 top-2 bg-red-500 text-xs text-white">
                      -{discount}%
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 h-12 font-medium text-gray-900 group-hover:text-amber-600">
                    {product.name}
                  </h3>
                  <div className="h-5">
                    <p className="text-sm text-gray-500">
                      {product.category?.name}
                    </p>
                  </div>
                  <div className="mt-auto flex items-baseline gap-2 pt-2">
                    <span className="font-bold text-amber-600">
                      {formatPrice(Number(product.price))}
                    </span>
                    <span className="text-xs text-gray-500">
                      /{product.unit}
                    </span>
                    {product.comparePrice && (
                      <span className="text-sm text-gray-400 line-through">
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
