"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Truck,
  Shield,
  ChevronRight,
  Home,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { formatPrice, formatUnit, formatQuantity } from "@/lib/utils";
import { cartStore } from "@/stores";
import { useXStateSelector } from "@/hooks";
import { api } from "@/trpc/react";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { items } = useXStateSelector(cartStore, ({ context }) => context);
  const { data: settings } = api.settings.getPublicSettings.useQuery();

  // Get settings from DB or use defaults
  const freeShippingThreshold = Number(
    settings?.shippingFreeThreshold ?? DEFAULT_SETTINGS.shippingFreeThreshold
  );
  const shippingRate = Number(
    settings?.shippingBaseRate ?? DEFAULT_SETTINGS.shippingBaseRate
  );

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    cartStore.send({ type: "hydrate" });
    setIsMounted(true);
  }, []);

  // Show loading state until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-transparent">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-[#b8743a]" />
            <p className="mt-4 text-[#6b5645]">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingRate;
  const total = subtotal + shipping;

  const handleIncrement = (productId: string) => {
    cartStore.send({ type: "incrementQuantity", productId });
  };

  const handleDecrement = (productId: string) => {
    cartStore.send({ type: "decrementQuantity", productId });
  };

  const handleRemove = (productId: string) => {
    cartStore.send({ type: "removeItem", productId });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-transparent">
        <div className="container mx-auto px-4 py-12">
          <FadeIn className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-[#f7efe7] p-8">
              <ShoppingCart className="h-16 w-16 text-[#b0896d]" />
            </div>
            <h1 className="font-display mt-6 text-2xl text-[#2d1c12]">
              Your cart is empty
            </h1>
            <p className="mt-2 text-[#6b5645]">
              Looks like you haven&apos;t added anything to your cart yet
            </p>
            <Button
              className="mt-8 rounded-full bg-[#b8743a] hover:bg-[#a4632f]"
              size="lg"
              asChild
            >
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Start Shopping
              </Link>
            </Button>
          </FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Breadcrumb */}
      <div className="border-b border-black/5 bg-white/70">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center text-[#9c826a] hover:text-[#b8743a]"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-[#2d1c12]">Shopping Cart</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <h1 className="font-display mb-8 text-3xl text-[#2d1c12]">
            Shopping Cart ({items.length}{" "}
            {items.length === 1 ? "item" : "items"})
          </h1>
        </FadeIn>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="border border-black/5 bg-white/80">
              <CardContent className="p-0">
                <StaggerContainer className="divide-y">
                  {items.map((item) => (
                    <StaggerItem
                      key={item.productId}
                      className="flex gap-4 p-4 md:p-6"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/product/${item.slug}`}
                        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-black/5 bg-[#f5efe7] md:h-32 md:w-32"
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 96px, 128px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingCart className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div>
                            <Link
                              href={`/product/${item.slug}`}
                              className="font-medium text-[#2d1c12] hover:text-[#b8743a]"
                            >
                              {item.name}
                            </Link>
                            <p className="mt-1 text-sm text-[#9c826a]">
                              {formatPrice(item.price)} /{" "}
                              {formatUnit(item.unit)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#9c826a] hover:text-[#b3474d]"
                            onClick={() => handleRemove(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center rounded-full border border-black/10 bg-white/80">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-r-none sm:h-9 sm:w-9"
                                onClick={() => handleDecrement(item.productId)}
                              >
                                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <div className="flex h-8 w-12 items-center justify-center text-sm font-medium text-[#2d1c12] sm:h-9 sm:w-16">
                                {formatQuantity(item.quantity, item.unit)}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-l-none sm:h-9 sm:w-9"
                                onClick={() => handleIncrement(item.productId)}
                              >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                            {/* Delete Button - icon only on mobile */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#b3474d] hover:bg-[#f7e6e6] hover:text-[#9a3a40] sm:hidden"
                              onClick={() => handleRemove(item.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hidden text-[#b3474d] hover:bg-[#f7e6e6] hover:text-[#9a3a40] sm:inline-flex"
                              onClick={() => handleRemove(item.productId)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Remove
                            </Button>
                          </div>

                          {/* Item Total */}
                          <span className="text-base font-semibold text-[#2d1c12] sm:text-lg">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <div className="mt-4">
              <Button variant="ghost" asChild className="text-[#2d1c12]">
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <FadeIn delay={0.2}>
              <Card className="sticky top-24 border border-black/5 bg-white/80">
                <CardHeader>
                  <CardTitle className="font-display text-xl text-[#2d1c12]">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b5645]">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b5645]">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-emerald-600">FREE</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {subtotal < freeShippingThreshold && (
                    <p className="text-xs text-[#b8743a]">
                      Add {formatPrice(freeShippingThreshold - subtotal)} more
                      for free shipping!
                    </p>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-[#2d1c12]">
                      Total
                    </span>
                    <span className="text-lg font-semibold text-[#b8743a]">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <Button
                    className="w-full rounded-full bg-[#b8743a] hover:bg-[#a4632f]"
                    size="lg"
                    asChild
                  >
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="flex items-center gap-2 text-xs text-[#6b5645]">
                      <Truck className="h-4 w-4 text-[#b8743a]" />
                      <span>
                        Free shipping above {formatPrice(freeShippingThreshold)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#6b5645]">
                      <Shield className="h-4 w-4 text-[#b8743a]" />
                      <span>Secure checkout</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
