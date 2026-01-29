"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPrice, formatUnit, formatQuantity } from "@/lib/utils";
import { cartStore } from "@/stores";
import { useXStateSelector } from "@/hooks";

export function CartDrawer() {
  const [isMounted, setIsMounted] = useState(false);
  const { items, isOpen } = useXStateSelector(
    cartStore,
    ({ context }) => context
  );

  // Only compute values after mount to avoid hydration mismatch
  const isEmpty = isMounted ? items.length === 0 : true;
  const total = isMounted
    ? items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    cartStore.send({ type: "hydrate" });
    setIsMounted(true);
  }, []);

  const handleClose = () => {
    cartStore.send({ type: "closeCart" });
  };

  const handleIncrement = (productId: string) => {
    cartStore.send({ type: "incrementQuantity", productId });
  };

  const handleDecrement = (productId: string) => {
    cartStore.send({ type: "decrementQuantity", productId });
  };

  const handleRemove = (productId: string) => {
    cartStore.send({ type: "removeItem", productId });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="flex w-full flex-col border-l border-black/5 bg-white/95 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-black/5 px-4 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
            {items.length > 0 && (
              <span className="bg-ink-1 text-paper-1 rounded-full px-2 py-0.5 text-xs">
                {items.length}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
            <div className="bg-paper-2 rounded-full p-6">
              <ShoppingCart className="text-muted-3 h-12 w-12" />
            </div>
            <div className="text-center">
              <p className="text-ink-1 text-lg font-medium">
                Your cart is empty
              </p>
              <p className="text-muted-2 mt-1 text-sm">
                Add some beautiful fabrics to get started
              </p>
            </div>
            <Button
              className="bg-ink-1 text-paper-1 hover:bg-ink-0 mt-4 rounded-full"
              onClick={handleClose}
              asChild
            >
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1">
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 p-4">
                    {/* Product Image */}
                    <div className="bg-paper-2 relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingCart className="text-muted-3 h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          className="text-ink-1 hover:text-brand-3 line-clamp-2 text-sm font-medium"
                          onClick={handleClose}
                        >
                          {item.name}
                        </Link>
                        <button
                          className="text-muted-3 hover:text-danger-4 flex-shrink-0 p-1"
                          onClick={() => handleRemove(item.productId)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-muted-2 mt-1 text-sm">
                        {formatPrice(item.price)} /{" "}
                        {formatUnit(
                          item.sellingMode === "piece" ? "piece" : "meter"
                        )}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center">
                          <div className="flex items-center rounded-full border border-black/10 bg-white/80">
                            <button
                              className="hover:bg-paper-1 flex h-7 w-7 items-center justify-center"
                              onClick={() => handleDecrement(item.productId)}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {formatQuantity(
                                item.quantity,
                                item.sellingMode === "piece" ? "piece" : "meter"
                              )}
                            </span>
                            <button
                              className="hover:bg-paper-1 flex h-7 w-7 items-center justify-center"
                              onClick={() => handleIncrement(item.productId)}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            className="text-muted-3 hover:bg-danger-1 hover:text-danger-4 ml-2 rounded-full p-1.5"
                            onClick={() => handleRemove(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <span className="text-ink-1 text-sm font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Cart Footer */}
            <SheetFooter className="block border-t border-black/5 px-4 py-4">
              {/* Subtotal */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-ink-1 font-medium">Subtotal</span>
                <span className="text-ink-1 text-lg font-bold">
                  {formatPrice(total)}
                </span>
              </div>

              <p className="text-muted-2 mb-3 text-center text-xs">
                Shipping and taxes calculated at checkout
              </p>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  className="bg-ink-1 text-paper-1 hover:bg-ink-0 w-full rounded-full"
                  asChild
                  onClick={handleClose}
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button
                  variant="outline"
                  className="hover:bg-paper-1 w-full rounded-full border-black/10 bg-white/80"
                  asChild
                  onClick={handleClose}
                >
                  <Link href="/cart">View Cart</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger-4 hover:bg-danger-1 hover:text-danger-5 w-full"
                  onClick={() => cartStore.send({ type: "clearCart" })}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Cart
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
