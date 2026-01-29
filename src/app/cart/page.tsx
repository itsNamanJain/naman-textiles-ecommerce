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
            <Loader2 className="text-brand-1 h-12 w-12 animate-spin" />
            <p className="text-muted-1 mt-4">Loading cart...</p>
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
            <div className="bg-paper-1 rounded-full p-8">
              <ShoppingCart className="text-muted-3 h-16 w-16" />
            </div>
            <h1 className="font-display text-ink-1 mt-6 text-2xl">
              Your cart is empty
            </h1>
            <p className="text-muted-1 mt-2">
              Looks like you haven&apos;t added anything to your cart yet
            </p>
            <Button
              className="bg-brand-1 hover:bg-brand-2 mt-8 rounded-full"
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
              className="text-muted-2 hover:text-brand-1 flex items-center"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="text-muted-3 h-4 w-4" />
            <span className="text-ink-1 font-medium">Shopping Cart</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <h1 className="font-display text-ink-1 mb-8 text-3xl">
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
                        className="bg-paper-2 relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-black/5 md:h-32 md:w-32"
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
                            <ShoppingCart className="text-muted-3 h-8 w-8" />
                          </div>
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div>
                            <Link
                              href={`/product/${item.slug}`}
                              className="text-ink-1 hover:text-brand-1 font-medium"
                            >
                              {item.name}
                            </Link>
                            <p className="text-muted-2 mt-1 text-sm">
                              {formatPrice(item.price)} /{" "}
                              {formatUnit(
                                item.sellingMode === "piece" ? "piece" : "meter"
                              )}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-2 hover:text-danger-1 h-8 w-8"
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
                              <div className="text-ink-1 flex h-8 w-12 items-center justify-center text-sm font-medium sm:h-9 sm:w-16">
                                {formatQuantity(
                                  item.quantity,
                                  item.sellingMode === "piece"
                                    ? "piece"
                                    : "meter"
                                )}
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
                              className="text-danger-1 hover:bg-danger-3 hover:text-danger-2 h-8 w-8 sm:hidden"
                              onClick={() => handleRemove(item.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-danger-1 hover:bg-danger-3 hover:text-danger-2 hidden sm:inline-flex"
                              onClick={() => handleRemove(item.productId)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Remove
                            </Button>
                          </div>

                          {/* Item Total */}
                          <span className="text-ink-1 text-base font-semibold sm:text-lg">
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
              <Button variant="ghost" asChild className="text-ink-1">
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
                  <CardTitle className="font-display text-ink-1 text-xl">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-1">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-1">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-success-1">FREE</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {subtotal < freeShippingThreshold && (
                    <p className="text-brand-1 text-xs">
                      Add {formatPrice(freeShippingThreshold - subtotal)} more
                      for free shipping!
                    </p>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-ink-1 text-lg font-semibold">
                      Total
                    </span>
                    <span className="text-brand-1 text-lg font-semibold">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <Button
                    className="bg-brand-1 hover:bg-brand-2 w-full rounded-full"
                    size="lg"
                    asChild
                  >
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="text-muted-1 flex items-center gap-2 text-xs">
                      <Truck className="text-brand-1 h-4 w-4" />
                      <span>
                        Free shipping above {formatPrice(freeShippingThreshold)}
                      </span>
                    </div>
                    <div className="text-muted-1 flex items-center gap-2 text-xs">
                      <Shield className="text-brand-1 h-4 w-4" />
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
