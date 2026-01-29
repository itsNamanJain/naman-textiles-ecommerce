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
import {
  MAX_METER_ORDER_QUANTITY,
  MAX_PIECE_ORDER_QUANTITY,
} from "@/lib/constants";
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
    minOrderQuantity: string;
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
    onMutate: async () => {
      await utils.wishlist.isInWishlist.cancel({ productId: product.id });
      const previousIsInWishlist = utils.wishlist.isInWishlist.getData({
        productId: product.id,
      });
      const previousCount = utils.wishlist.count.getData();
      const optimisticNext =
        previousIsInWishlist === undefined ? true : !previousIsInWishlist;

      utils.wishlist.isInWishlist.setData(
        { productId: product.id },
        optimisticNext
      );

      if (
        typeof previousCount === "number" &&
        typeof previousIsInWishlist === "boolean"
      ) {
        utils.wishlist.count.setData(
          undefined,
          previousCount + (optimisticNext ? 1 : -1)
        );
      }

      return { previousIsInWishlist, previousCount };
    },
    onSuccess: (data) => {
      utils.wishlist.isInWishlist.setData(
        { productId: product.id },
        data.isInWishlist
      );
      toast.success(data.message);
    },
    onError: (error, _vars, context) => {
      if (context) {
        utils.wishlist.isInWishlist.setData(
          { productId: product.id },
          context.previousIsInWishlist
        );
        if (typeof context.previousCount === "number") {
          utils.wishlist.count.setData(undefined, context.previousCount);
        }
      }
      toast.error(error.message || "Failed to update wishlist");
    },
    onSettled: () => {
      utils.wishlist.isInWishlist.invalidate({ productId: product.id });
      utils.wishlist.count.invalidate();
      utils.wishlist.get.invalidate();
      utils.wishlist.getProductIds.invalidate();
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
  const mainImage = product.images[0]?.url;
  const hoverImage = product.images[1]?.url ?? mainImage;

  const minQty = parseFloat(product.minOrderQuantity);
  const step = 1;
  const maxQty =
    product.sellingMode === "meter"
      ? MAX_METER_ORDER_QUANTITY
      : MAX_PIECE_ORDER_QUANTITY;

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
        sellingMode: product.sellingMode,
        minOrderQuantity: minQty,
      },
      quantity: minQty,
    });
    toast.success(`Added to cart`);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantityInCart + step <= maxQty) {
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

  const canIncrement = quantityInCart + step <= maxQty;
  const canDecrement = quantityInCart - step >= minQty;

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-black/5 bg-white/90 py-0 shadow-[0_10px_30px_rgba(15,15,15,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(15,15,15,0.12)]",
        className
      )}
    >
      {/* Image */}
      <div className="bg-paper-2 relative aspect-square overflow-hidden">
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
              <ImageIcon className="text-muted-3 h-10 w-10" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {discount && (
            <Badge className="bg-danger-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white">
              -{discount}%
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-brand-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Featured
            </Badge>
          )}
        </div>

        {/* Wishlist */}
        <button
          className={cn(
            "absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow transition-all hover:scale-110",
            isInWishlist ? "text-danger-1" : "text-muted-3 hover:text-danger-1"
          )}
          onClick={handleToggleWishlist}
          disabled={toggleWishlistMutation.isPending}
        >
          <Heart
            className={cn("h-3.5 w-3.5", isInWishlist && "fill-current")}
          />
        </button>

        {/* Cart Controls */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 p-1 transition-all duration-200",
            isInCart
              ? "translate-y-0"
              : "translate-y-0 md:translate-y-full md:group-hover:translate-y-0"
          )}
        >
          {isInCart ? (
            <div className="flex items-center justify-center gap-1">
              <button
                className="text-danger-4 hover:bg-danger-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow transition-all active:scale-95"
                onClick={handleRemove}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="flex items-center overflow-hidden rounded-full bg-white shadow">
                <button
                  className={cn(
                    "flex h-8 w-8 items-center justify-center transition-all active:scale-95",
                    canDecrement
                      ? "text-muted-1 hover:bg-paper-1"
                      : "text-muted-3 cursor-not-allowed"
                  )}
                  onClick={handleDecrement}
                  disabled={!canDecrement}
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
                <div className="bg-paper-1 flex h-8 min-w-[32px] items-center justify-center px-1">
                  <span className="text-ink-1 text-sm font-bold">
                    {quantityInCart}
                  </span>
                </div>
                <button
                  className={cn(
                    "flex h-8 w-8 items-center justify-center transition-all active:scale-95",
                    canIncrement
                      ? "text-muted-1 hover:bg-paper-1"
                      : "text-muted-3 cursor-not-allowed"
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
                className="bg-brand-1 hover:bg-brand-2 h-8 rounded-full px-3 text-xs font-semibold shadow active:scale-[0.98]"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <CardContent className="flex flex-1 flex-col p-2">
        {product.category && (
          <Link
            href={`/category/${product.category.slug}`}
            className="text-muted-3 hover:text-brand-1 text-[10px] font-semibold tracking-[0.2em] uppercase"
          >
            {product.category.name}
          </Link>
        )}
        <Link href={`/product/${product.slug}`} className="mt-0.5">
          <h3 className="text-ink-1 hover:text-brand-1 line-clamp-2 text-sm leading-tight font-semibold">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-baseline gap-1 pt-1.5">
          <span className="text-ink-1 text-sm font-semibold">
            {formatPrice(price)}
          </span>
          <span className="text-muted-2 text-[10px]">
            /{formatUnit(product.sellingMode === "piece" ? "piece" : "meter")}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-muted-2 text-[10px] line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>
        {isInCart && (
          <span className="text-brand-1 mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold">
            <ShoppingCart className="h-2.5 w-2.5" />
            {formatPrice(price * quantityInCart)} in cart
          </span>
        )}
      </CardContent>
    </Card>
  );
}
