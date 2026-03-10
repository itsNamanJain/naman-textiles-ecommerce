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
import { ShareButton } from "@/components/products/share-button";
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
    stockQuantity: number;
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
  const isOutOfStock = product.stockQuantity === 0;

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
        "group relative flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-black/[0.04] bg-white py-0 shadow-none transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(15,15,15,0.1)]",
        className
      )}
    >
      {/* Image */}
      <div className="bg-paper-1 relative aspect-[3/4] overflow-hidden">
        <Link href={`/product/${product.slug}`}>
          {mainImage ? (
            <>
              <Image
                src={mainImage}
                alt={product.images[0]?.alt ?? product.name}
                fill
                className="object-cover transition-all duration-500 ease-out group-hover:scale-[1.08] group-hover:opacity-0"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <Image
                src={hoverImage ?? mainImage}
                alt={product.name}
                fill
                className="object-cover opacity-0 transition-all duration-500 ease-out group-hover:scale-[1.08] group-hover:opacity-100"
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
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {isOutOfStock && (
            <Badge className="bg-ink-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm">
              Out of Stock
            </Badge>
          )}
          {discount && !isOutOfStock && (
            <Badge className="bg-danger-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm">
              -{discount}%
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-brand-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm">
              Featured
            </Badge>
          )}
        </div>

        {/* Share & Wishlist */}
        <ShareButton product={product} compact />
        <button
          className={cn(
            "absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg",
            isInWishlist ? "text-danger-1" : "text-muted-3 hover:text-danger-1"
          )}
          onClick={handleToggleWishlist}
          disabled={toggleWishlistMutation.isPending}
        >
          <Heart
            className={cn("h-4 w-4", isInWishlist && "fill-current")}
          />
        </button>

        {/* Cart Controls */}
        {!isOutOfStock && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 p-2 transition-all duration-300",
            isInCart
              ? "translate-y-0"
              : "translate-y-0 md:translate-y-full md:group-hover:translate-y-0"
          )}
        >
          {isInCart ? (
            <div className="flex items-center justify-center gap-1.5">
              <button
                className="text-danger-4 hover:bg-danger-1 hover:text-white flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm transition-all duration-200 active:scale-95"
                onClick={handleRemove}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="flex items-center overflow-hidden rounded-full bg-white/95 shadow-md backdrop-blur-sm">
                <button
                  className={cn(
                    "flex h-9 w-9 items-center justify-center transition-all duration-200 active:scale-95",
                    canDecrement
                      ? "text-muted-1 hover:bg-paper-1"
                      : "text-muted-3 cursor-not-allowed"
                  )}
                  onClick={handleDecrement}
                  disabled={!canDecrement}
                >
                  <Minus className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <div className="bg-paper-1/80 flex h-9 min-w-[36px] items-center justify-center px-1">
                  <span className="text-ink-1 text-sm font-bold">
                    {quantityInCart}
                  </span>
                </div>
                <button
                  className={cn(
                    "flex h-9 w-9 items-center justify-center transition-all duration-200 active:scale-95",
                    canIncrement
                      ? "text-muted-1 hover:bg-paper-1"
                      : "text-muted-3 cursor-not-allowed"
                  )}
                  onClick={handleIncrement}
                  disabled={!canIncrement}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                className="bg-brand-1 hover:bg-brand-2 h-10 rounded-full px-5 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-[0.97] transition-all duration-300"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-1.5 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Info */}
      <CardContent className="flex flex-1 flex-col p-3">
        {product.category && (
          <Link
            href={`/category/${product.category.slug}`}
            className="text-muted-2 hover:text-brand-1 text-xs font-medium tracking-[0.12em] uppercase transition-colors duration-200"
          >
            {product.category.name}
          </Link>
        )}
        <Link href={`/product/${product.slug}`} className="mt-1">
          <h3 className="text-ink-1 hover:text-brand-1 line-clamp-2 text-base leading-snug font-semibold transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-baseline gap-1.5 pt-2">
          <span className="text-ink-0 text-lg font-bold">
            {formatPrice(price)}
          </span>
          <span className="text-muted-2 text-xs">
            /{formatUnit(product.sellingMode === "piece" ? "piece" : "meter")}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-muted-2 text-xs line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>
        {isInCart && (
          <span className="text-brand-1 mt-1 inline-flex items-center gap-1 text-xs font-semibold">
            <ShoppingCart className="h-3 w-3" />
            {formatPrice(price * quantityInCart)} in cart
          </span>
        )}
      </CardContent>
    </Card>
  );
}
