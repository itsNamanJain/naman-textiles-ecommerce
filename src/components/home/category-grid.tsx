"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FadeInView,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";
import { api } from "@/trpc/react";

interface CategoryGridProps {
  title?: string;
  subtitle?: string;
}

// Neutral palette for category cards
const categoryTints = [
  "from-[#fdf4e9] to-[#f6e6d2]",
  "from-[#f9efe4] to-[#f1dfc7]",
  "from-[#fdf6ee] to-[#f4e5cf]",
  "from-[#f7efe7] to-[#ead8c3]",
];

export function CategoryGrid({
  title = "Shop by Category",
  subtitle = "Explore our wide range of premium fabrics",
}: CategoryGridProps) {
  const { data: categories, isLoading } =
    api.category.getAllWithCounts.useQuery();

  const displayCategories = categories ?? [];

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <FadeInView className="mb-8 text-center md:mb-12">
          <h2 className="font-display mb-2 text-2xl text-[#2d1c12] md:text-3xl lg:text-4xl">
            {title}
          </h2>
          <p className="text-sm text-[#6b5645] md:text-base">{subtitle}</p>
        </FadeInView>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : displayCategories.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No categories found
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {displayCategories.map((category, index) => (
              <StaggerItem key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group block"
                >
                  <div
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-br p-5 transition-all duration-300",
                      "hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,15,15,0.1)]",
                      categoryTints[index % categoryTints.length]
                    )}
                  >
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-40">
                      <svg
                        className="h-full w-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <pattern
                            id={`pattern-${category.id}`}
                            patternUnits="userSpaceOnUse"
                            width="20"
                            height="20"
                          >
                            <circle cx="10" cy="10" r="1.6" fill="white" />
                          </pattern>
                        </defs>
                        <rect
                          width="100"
                          height="100"
                          fill={`url(#pattern-${category.id})`}
                        />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="relative flex h-full flex-col justify-end">
                      <h3 className="text-lg font-semibold text-[#2d1c12] md:text-xl">
                        {category.name}
                      </h3>
                      {category.productCount !== undefined &&
                        category.productCount > 0 && (
                          <p className="text-sm text-[#7a5c3a]">
                            {category.productCount}{" "}
                            {category.productCount === 1
                              ? "Product"
                              : "Products"}
                          </p>
                        )}
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="rounded-full bg-white/70 p-2 text-[#2d1c12] shadow-sm">
                        <svg
                          className="h-4 w-4 text-[#2d1c12]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
