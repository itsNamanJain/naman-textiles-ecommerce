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
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
            {items.length > 0 && (
              <span className="rounded-full bg-amber-600 px-2 py-0.5 text-xs text-white">
                {items.length}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
            <div className="rounded-full bg-gray-100 p-6">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Add some beautiful fabrics to get started
              </p>
            </div>
            <Button
              className="mt-4 bg-amber-600 hover:bg-amber-700"
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
                  <div
                  key={item.productId}
                    className="flex gap-3 p-4"
                  >
                    {/* Product Image */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
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
                          <ShoppingCart className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-amber-600"
                          onClick={handleClose}
                        >
                          {item.name}
                        </Link>
                        <button
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500"
                          onClick={() =>
                            handleRemove(item.productId)
                          }
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatPrice(item.price)} / {formatUnit(item.unit)}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center">
                          <div className="flex items-center rounded border">
                            <button
                              className="flex h-7 w-7 items-center justify-center hover:bg-gray-100"
                              onClick={() =>
                                handleDecrement(item.productId)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {formatQuantity(item.quantity, item.unit)}
                            </span>
                            <button
                              className="flex h-7 w-7 items-center justify-center hover:bg-gray-100"
                              onClick={() =>
                                handleIncrement(item.productId)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            className="ml-2 rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                            onClick={() =>
                              handleRemove(item.productId)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Cart Footer */}
            <SheetFooter className="block border-t px-4 py-4">
              {/* Subtotal */}
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium text-gray-900">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(total)}
                </span>
              </div>

              <p className="mb-3 text-center text-xs text-gray-500">
                Shipping and taxes calculated at checkout
              </p>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  asChild
                  onClick={handleClose}
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                  onClick={handleClose}
                >
                  <Link href="/cart">View Cart</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
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
