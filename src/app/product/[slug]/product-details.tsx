"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  ChevronRight,
  Home,
  Check,
  Truck,
  Shield,
  RotateCcw,
  ImageIcon,
  Trash2,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/ui/motion";
import { formatPrice, cn } from "@/lib/utils";
import { cartStore } from "@/stores";
import { useXStateSelector } from "@/hooks";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  comparePrice: string | null;
  sellingMode: "meter" | "piece";
  minOrderQuantity: string;
  categoryId: string;
  category: { id: string; name: string; slug: string } | null;
  images: { id: string; url: string; alt: string | null }[];
};

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  // Get cart items from store
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

  const utils = api.useUtils();
  const { data: isInWishlist } = api.wishlist.isInWishlist.useQuery(
    { productId: product.id },
    { enabled: isAuthenticated, retry: false }
  );

  const { data: reviews, isLoading: isLoadingReviews } =
    api.review.getByProduct.useQuery({ productId: product.id });

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const createReviewMutation = api.review.create.useMutation({
    onSuccess: () => {
      toast.success("Review submitted for approval");
      setTitle("");
      setComment("");
      setRating(5);
      utils.review.getByProduct.invalidate({ productId: product.id });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });

  const toggleWishlistMutation = api.wishlist.toggle.useMutation({
    onSuccess: (data) => {
      utils.wishlist.isInWishlist.invalidate({ productId: product.id });
      utils.wishlist.count.invalidate();
      toast.success(data.message);
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("Please sign in to add to wishlist");
      } else {
        toast.error(error.message || "Failed to update wishlist");
      }
    },
  });

  const minQty = Number(product.minOrderQuantity);
  const maxQty = Infinity;
  const step = 1;
  const price = Number(product.price);
  const unitLabel = product.sellingMode === "piece" ? "piece" : "meter";

  const handleAddToCart = () => {
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

  const handleIncrement = () => {
    if (quantityInCart + step <= maxQty) {
      cartStore.send({ type: "incrementQuantity", productId: product.id });
    }
  };

  const handleDecrement = () => {
    cartStore.send({ type: "decrementQuantity", productId: product.id });
  };

  const handleRemove = () => {
    cartStore.send({ type: "removeItem", productId: product.id });
    toast.success("Removed from cart");
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add to wishlist");
      return;
    }
    toggleWishlistMutation.mutate({ productId: product.id });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description ?? `Check out ${product.name}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to leave a review");
      return;
    }
    createReviewMutation.mutate({
      productId: product.id,
      rating,
      title: title.trim() ? title.trim() : undefined,
      comment: comment.trim(),
    });
  };

  const discount = product.comparePrice
    ? Math.round(
        ((Number(product.comparePrice) - price) /
          Number(product.comparePrice)) *
          100
      )
    : 0;

  const inStock = true;
  const canIncrement = quantityInCart + step <= maxQty;
  const canDecrement = quantityInCart - step >= minQty;

  return (
    <div className="bg-transparent">
      {/* Breadcrumb */}
      <div className="border-b border-black/5 bg-white/70">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-2 hover:text-brand-1">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="text-muted-3 h-4 w-4" />
            <Link href="/products" className="text-muted-2 hover:text-brand-1">
              Products
            </Link>
            {product.category && (
              <>
                <ChevronRight className="text-muted-3 h-4 w-4" />
                <Link
                  href={`/category/${product.category.slug}`}
                  className="text-muted-2 hover:text-brand-1"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="text-muted-3 h-4 w-4" />
            <span className="text-ink-1 line-clamp-1 font-medium">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image Gallery */}
          <FadeIn className="space-y-3">
            <div className="bg-paper-2 relative aspect-square overflow-hidden rounded-2xl border border-black/5 shadow-[0_20px_50px_rgba(15,15,15,0.1)]">
              {product.images[selectedImage]?.url ? (
                <Image
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].alt ?? product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="text-muted-3 h-24 w-24" />
                </div>
              )}
              {discount > 0 && (
                <Badge className="bg-danger-1 absolute top-3 left-3 text-white">
                  -{discount}%
                </Badge>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                      selectedImage === index
                        ? "border-brand-1"
                        : "hover:border-warm-6 border-transparent"
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt ?? `${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </FadeIn>

          {/* Product Info */}
          <FadeIn delay={0.1} className="space-y-4">
            {product.category && (
              <Link
                href={`/category/${product.category.slug}`}
                className="text-muted-3 hover:text-brand-1 text-xs font-semibold tracking-[0.2em] uppercase"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="font-display text-ink-1 text-2xl md:text-3xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-brand-1 text-3xl font-semibold">
                {formatPrice(price)}
              </span>
              <span className="text-brand-3">/{unitLabel}</span>
              {product.comparePrice && (
                <span className="text-muted-2 text-xl line-through">
                  {formatPrice(Number(product.comparePrice))}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <>
                  <Check className="text-success-1 h-5 w-5" />
                  <span className="text-success-1 font-semibold">In Stock</span>
                  <span className="text-brand-3">Available</span>
                </>
              ) : (
                <span className="text-danger-1 font-semibold">
                  Out of Stock
                </span>
              )}
            </div>

            <Separator />

            {/* Cart Controls */}
            {inStock && (
              <div className="space-y-3">
                {isInCart ? (
                  <>
                    <div className="flex items-center gap-3">
                      {/* Trash Button */}
                      <button
                        className="bg-danger-3 text-danger-1 hover:bg-danger-5 flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
                        onClick={handleRemove}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      {/* Quantity Control */}
                      <div className="flex items-center overflow-hidden rounded-full border border-black/10 bg-white/80">
                        <button
                          className={cn(
                            "flex h-10 w-10 items-center justify-center transition-all active:scale-95",
                            canDecrement
                              ? "text-ink-2 hover:bg-paper-1"
                              : "text-muted-3 cursor-not-allowed"
                          )}
                          onClick={handleDecrement}
                          disabled={!canDecrement}
                        >
                          <Minus className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <div className="flex h-10 min-w-[48px] items-center justify-center bg-white px-2">
                          <span className="text-ink-1 text-lg font-semibold">
                            {quantityInCart}
                          </span>
                        </div>
                        <button
                          className={cn(
                            "flex h-10 w-10 items-center justify-center transition-all active:scale-95",
                            canIncrement
                              ? "text-ink-2 hover:bg-paper-1"
                              : "text-muted-3 cursor-not-allowed"
                          )}
                          onClick={handleIncrement}
                          disabled={!canIncrement}
                        >
                          <Plus className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                      </div>

                      <span className="text-muted-2 text-sm">
                        {unitLabel} (Step: {step})
                      </span>
                    </div>

                    {/* Cart Total */}
                    <div className="bg-paper-1 text-brand-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
                      <ShoppingCart className="h-4 w-4" />
                      {formatPrice(price * quantityInCart)} in cart
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button
                      size="lg"
                      className="bg-brand-1 hover:bg-brand-2 flex-1 rounded-full"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                    <span className="text-muted-2 text-sm">
                      Min: {minQty} {unitLabel}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist & Share */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-ink-1 flex-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
                onClick={handleToggleWishlist}
                disabled={toggleWishlistMutation.isPending}
              >
                <Heart
                  className={cn(
                    "mr-2 h-4 w-4",
                    isInWishlist && "fill-danger-1 text-danger-1"
                  )}
                />
                {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
              </Button>
              <Button
                variant="outline"
                className="text-ink-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-black/5 bg-white/80 p-3">
              <div className="flex flex-col items-center text-center">
                <Truck className="text-brand-1 mb-1 h-5 w-5" />
                <span className="text-xs font-medium">Free Delivery</span>
                <span className="text-muted-2 text-[10px]">Above ₹999</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="text-brand-1 mb-1 h-5 w-5" />
                <span className="text-xs font-medium">Quality Assured</span>
                <span className="text-muted-2 text-[10px]">100% Genuine</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw className="text-brand-1 mb-1 h-5 w-5" />
                <span className="text-xs font-medium">Easy Returns</span>
                <span className="text-muted-2 text-[10px]">7 Days</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="text-ink-1 font-semibold">Description</h3>
                <p className="text-muted-1 text-sm whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Reviews */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-ink-1 font-semibold">Reviews</h3>
              {isLoadingReviews ? (
                <p className="text-muted-1 text-sm">Loading reviews...</p>
              ) : !reviews || reviews.length === 0 ? (
                <p className="text-muted-1 text-sm">
                  No reviews yet. Be the first to review this product.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-black/5 bg-white/80 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-ink-1 font-medium">
                            {review.user?.name ?? "Customer"}
                          </p>
                          {review.isVerified && (
                            <span className="bg-paper-1 text-brand-3 rounded-full px-2 py-0.5 text-xs font-semibold">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="text-brand-1 flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4" />
                          ))}
                        </div>
                      </div>
                      {review.title && (
                        <p className="text-ink-1 mt-2 font-medium">
                          {review.title}
                        </p>
                      )}
                      <p className="text-muted-1 mt-1 text-sm">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-2xl border border-black/5 bg-white/80 p-4">
                <h4 className="text-ink-1 font-medium">Write a review</h4>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-1 text-sm">Rating:</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const value = i + 1;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            className={
                              value <= rating ? "text-brand-1" : "text-muted-3"
                            }
                            aria-label={`Rate ${value} stars`}
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <input
                    className="w-full rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-sm"
                    placeholder="Title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-sm"
                    rows={4}
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      className="bg-brand-1 hover:bg-brand-2 rounded-full"
                      onClick={handleSubmitReview}
                      disabled={
                        createReviewMutation.isPending ||
                        comment.trim().length < 10
                      }
                    >
                      {createReviewMutation.isPending
                        ? "Submitting..."
                        : "Submit Review"}
                    </Button>
                    {!isAuthenticated && (
                      <span className="text-muted-2 text-sm">
                        Sign in to submit
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
