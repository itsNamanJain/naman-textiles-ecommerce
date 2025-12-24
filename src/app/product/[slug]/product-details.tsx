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
  shortDescription: string | null;
  price: string;
  comparePrice: string | null;
  sellingMode: "meter" | "piece";
  unit: string;
  minOrderQuantity: string;
  quantityStep: string;
  maxOrderQuantity: string | null;
  stockQuantity: string;
  fabricType: string | null;
  material: string | null;
  width: string | null;
  weight: string | null;
  color: string | null;
  pattern: string | null;
  composition: string | null;
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
  const maxQty = Math.min(
    product.maxOrderQuantity ? Number(product.maxOrderQuantity) : Infinity,
    Number(product.stockQuantity)
  );
  const step = Number(product.quantityStep);
  const price = Number(product.price);

  const handleAddToCart = () => {
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
        maxOrderQuantity: product.maxOrderQuantity
          ? Number(product.maxOrderQuantity)
          : undefined,
        stockQuantity: Number(product.stockQuantity),
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
          text: product.shortDescription ?? `Check out ${product.name}`,
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

  const discount = product.comparePrice
    ? Math.round(
        ((Number(product.comparePrice) - price) /
          Number(product.comparePrice)) *
          100
      )
    : 0;

  const inStock = Number(product.stockQuantity) > 0;
  const canIncrement = quantityInCart + step <= maxQty;
  const canDecrement = quantityInCart - step >= minQty;

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-amber-600">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link
              href="/products"
              className="text-gray-500 hover:text-amber-600"
            >
              Products
            </Link>
            {product.category && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <Link
                  href={`/category/${product.category.slug}`}
                  className="text-gray-500 hover:text-amber-600"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="line-clamp-1 font-medium text-gray-900">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image Gallery */}
          <FadeIn className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
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
                  <ImageIcon className="h-24 w-24 text-gray-300" />
                </div>
              )}
              {discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-rose-500 text-white">
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
                      "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                      selectedImage === index
                        ? "border-amber-500"
                        : "border-transparent hover:border-gray-300"
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
                className="text-sm text-amber-600 hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-amber-600">
                {formatPrice(price)}
              </span>
              <span className="text-gray-500">/{product.unit}</span>
              {product.comparePrice && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(Number(product.comparePrice))}
                </span>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-gray-600">{product.shortDescription}</p>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">In Stock</span>
                  <span className="text-gray-500">
                    ({product.stockQuantity} {product.unit}s available)
                  </span>
                </>
              ) : (
                <span className="font-medium text-red-600">Out of Stock</span>
              )}
            </div>

            <Separator />

            {/* Fabric Details */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {product.fabricType && (
                <div>
                  <span className="text-gray-500">Fabric:</span>
                  <span className="ml-2 font-medium">{product.fabricType}</span>
                </div>
              )}
              {product.material && (
                <div>
                  <span className="text-gray-500">Material:</span>
                  <span className="ml-2 font-medium">{product.material}</span>
                </div>
              )}
              {product.composition && (
                <div>
                  <span className="text-gray-500">Composition:</span>
                  <span className="ml-2 font-medium">
                    {product.composition}
                  </span>
                </div>
              )}
              {product.width && (
                <div>
                  <span className="text-gray-500">Width:</span>
                  <span className="ml-2 font-medium">{product.width}</span>
                </div>
              )}
              {product.weight && (
                <div>
                  <span className="text-gray-500">Weight:</span>
                  <span className="ml-2 font-medium">{product.weight}</span>
                </div>
              )}
              {product.color && (
                <div>
                  <span className="text-gray-500">Color:</span>
                  <span className="ml-2 font-medium">{product.color}</span>
                </div>
              )}
              {product.pattern && (
                <div>
                  <span className="text-gray-500">Pattern:</span>
                  <span className="ml-2 font-medium">{product.pattern}</span>
                </div>
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
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition-all hover:bg-rose-100 active:scale-95"
                        onClick={handleRemove}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      {/* Quantity Control */}
                      <div className="flex items-center overflow-hidden rounded-full border bg-gray-50">
                        <button
                          className={cn(
                            "flex h-10 w-10 items-center justify-center transition-all active:scale-95",
                            canDecrement
                              ? "text-gray-700 hover:bg-gray-100"
                              : "cursor-not-allowed text-gray-300"
                          )}
                          onClick={handleDecrement}
                          disabled={!canDecrement}
                        >
                          <Minus className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <div className="flex h-10 min-w-[48px] items-center justify-center bg-white px-2">
                          <span className="text-lg font-bold text-gray-900">
                            {quantityInCart}
                          </span>
                        </div>
                        <button
                          className={cn(
                            "flex h-10 w-10 items-center justify-center transition-all active:scale-95",
                            canIncrement
                              ? "text-gray-700 hover:bg-gray-100"
                              : "cursor-not-allowed text-gray-300"
                          )}
                          onClick={handleIncrement}
                          disabled={!canIncrement}
                        >
                          <Plus className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                      </div>

                      <span className="text-sm text-gray-500">
                        {product.unit} (Step: {step})
                      </span>
                    </div>

                    {/* Cart Total */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                      <ShoppingCart className="h-4 w-4" />
                      {formatPrice(price * quantityInCart)} in cart
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button
                      size="lg"
                      className="flex-1 rounded-full bg-amber-500 hover:bg-amber-600"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                    <span className="text-sm text-gray-500">
                      Min: {minQty} {product.unit}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist & Share */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={handleToggleWishlist}
                disabled={toggleWishlistMutation.isPending}
              >
                <Heart
                  className={cn(
                    "mr-2 h-4 w-4",
                    isInWishlist && "fill-rose-500 text-rose-500"
                  )}
                />
                {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3">
              <div className="flex flex-col items-center text-center">
                <Truck className="mb-1 h-5 w-5 text-amber-600" />
                <span className="text-xs font-medium">Free Delivery</span>
                <span className="text-[10px] text-gray-500">Above ₹999</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="mb-1 h-5 w-5 text-amber-600" />
                <span className="text-xs font-medium">Quality Assured</span>
                <span className="text-[10px] text-gray-500">100% Genuine</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw className="mb-1 h-5 w-5 text-amber-600" />
                <span className="text-xs font-medium">Easy Returns</span>
                <span className="text-[10px] text-gray-500">7 Days</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Description</h3>
                <p className="text-sm whitespace-pre-line text-gray-600">
                  {product.description}
                </p>
              </div>
            )}
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
