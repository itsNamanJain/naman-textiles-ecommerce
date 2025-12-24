"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Heart,
  ShoppingCart,
  ImageIcon,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, formatUnit, cn } from "@/lib/utils";
import { cartStore } from "@/stores";
import { useXStateSelector } from "@/hooks";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    comparePrice: string | null;
    sellingMode: "meter" | "piece";
    unit: string;
    minOrderQuantity: string;
    quantityStep: string;
    maxOrderQuantity: string | null;
    stockQuantity: string;
    isFeatured: boolean;
    images: { url: string; alt: string | null }[];
    category: { name: string; slug: string } | null;
  };
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const utils = api.useUtils();

  const cartItems = useXStateSelector(
    cartStore,
    ({ context }) => context.items
  );
  const cartItem = isMounted
    ? cartItems.find((item) => item.productId === product.id)
    : undefined;
  const quantityInCart = cartItem?.quantity ?? 0;
  const isInCart = quantityInCart > 0;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: isInWishlist } = api.wishlist.isInWishlist.useQuery(
    { productId: product.id },
    { enabled: isAuthenticated, retry: false }
  );

  const toggleWishlistMutation = api.wishlist.toggle.useMutation({
    onSuccess: (data) => {
      utils.wishlist.isInWishlist.invalidate({ productId: product.id });
      utils.wishlist.count.invalidate();
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update wishlist");
    },
  });

  const price = parseFloat(product.price);
  const comparePrice = product.comparePrice
    ? parseFloat(product.comparePrice)
    : null;
  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : null;
  const isOutOfStock = parseFloat(product.stockQuantity) <= 0;
  const mainImage = product.images[0]?.url;
  const hoverImage = product.images[1]?.url ?? mainImage;

  const minQty = parseFloat(product.minOrderQuantity);
  const step = parseFloat(product.quantityStep);
  const maxQty = product.maxOrderQuantity
    ? parseFloat(product.maxOrderQuantity)
    : parseFloat(product.stockQuantity);
  const stockQty = parseFloat(product.stockQuantity);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please sign in to add to wishlist");
      return;
    }
    toggleWishlistMutation.mutate({ productId: product.id });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cartStore.send({
      type: "addItem",
      item: {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0]?.url,
        price: price,
        unit: product.unit,
        sellingMode: product.sellingMode,
        minOrderQuantity: minQty,
        quantityStep: step,
        maxOrderQuantity: maxQty,
        stockQuantity: stockQty,
      },
      quantity: minQty,
    });
    toast.success(`Added to cart`);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantityInCart + step <= Math.min(maxQty, stockQty)) {
      cartStore.send({ type: "incrementQuantity", productId: product.id });
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cartStore.send({ type: "decrementQuantity", productId: product.id });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cartStore.send({ type: "removeItem", productId: product.id });
    toast.success("Removed from cart");
  };

  const canIncrement = quantityInCart + step <= Math.min(maxQty, stockQty);
  const canDecrement = quantityInCart - step >= minQty;

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col gap-0 overflow-hidden rounded-xl border bg-white py-0 transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/product/${product.slug}`}>
          {mainImage ? (
            <>
              <Image
                src={mainImage}
                alt={product.images[0]?.alt ?? product.name}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-0"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <Image
                src={hoverImage ?? mainImage}
                alt={product.name}
                fill
                className="object-cover opacity-0 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-gray-300" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {discount && (
            <Badge className="rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              -{discount}%
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Featured
            </Badge>
          )}
          {isOutOfStock && (
            <Badge className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Wishlist */}
        <button
          className={cn(
            "absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow transition-all hover:scale-110",
            isInWishlist ? "text-rose-500" : "text-gray-400 hover:text-rose-500"
          )}
          onClick={handleToggleWishlist}
          disabled={toggleWishlistMutation.isPending}
        >
          <Heart
            className={cn("h-3.5 w-3.5", isInWishlist && "fill-current")}
          />
        </button>

        {/* Cart Controls */}
        {!isOutOfStock && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 p-1 transition-all duration-200",
              isInCart
                ? "translate-y-0"
                : "translate-y-full group-hover:translate-y-0"
            )}
          >
            {isInCart ? (
              <div className="flex items-center justify-center gap-1">
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-rose-500 shadow transition-all hover:bg-rose-50 active:scale-95"
                  onClick={handleRemove}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center overflow-hidden rounded-full bg-white shadow">
                  <button
                    className={cn(
                      "flex h-8 w-8 items-center justify-center transition-all active:scale-95",
                      canDecrement
                        ? "text-gray-600 hover:bg-gray-100"
                        : "cursor-not-allowed text-gray-300"
                    )}
                    onClick={handleDecrement}
                    disabled={!canDecrement}
                  >
                    <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                  <div className="flex h-8 min-w-[32px] items-center justify-center bg-amber-50 px-1">
                    <span className="text-sm font-bold text-gray-900">
                      {quantityInCart}
                    </span>
                  </div>
                  <button
                    className={cn(
                      "flex h-8 w-8 items-center justify-center transition-all active:scale-95",
                      canIncrement
                        ? "text-gray-600 hover:bg-gray-100"
                        : "cursor-not-allowed text-gray-300"
                    )}
                    onClick={handleIncrement}
                    disabled={!canIncrement}
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button
                  className="h-8 rounded-full bg-amber-500 px-3 text-xs font-semibold shadow hover:bg-amber-600 active:scale-[0.98]"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                  Add to Cart
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <CardContent className="flex flex-1 flex-col p-2">
        {product.category && (
          <Link
            href={`/category/${product.category.slug}`}
            className="text-[10px] font-medium tracking-wide text-gray-400 uppercase hover:text-amber-600"
          >
            {product.category.name}
          </Link>
        )}
        <Link href={`/product/${product.slug}`} className="mt-0.5">
          <h3 className="line-clamp-2 text-sm leading-tight font-medium text-gray-800 hover:text-amber-600">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-baseline gap-1 pt-1.5">
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(price)}
          </span>
          <span className="text-[10px] text-gray-400">
            /{formatUnit(product.unit)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-[10px] text-gray-400 line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>
        {isInCart && (
          <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-amber-600">
            <ShoppingCart className="h-2.5 w-2.5" />
            {formatPrice(price * quantityInCart)} in cart
          </span>
        )}
      </CardContent>
    </Card>
  );
}
