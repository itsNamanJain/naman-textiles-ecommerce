"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { ProductCard } from "@/components/products";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function WishlistPage() {
  const [isMounted, setIsMounted] = useState(false);
  const utils = api.useUtils();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    data: wishlistData,
    isLoading,
    error,
  } = api.wishlist.get.useQuery(undefined, {
    retry: false,
    enabled: isMounted,
  });

  const clearMutation = api.wishlist.clear.useMutation({
    onSuccess: () => {
      utils.wishlist.get.invalidate();
      utils.wishlist.count.invalidate();
      utils.wishlist.getProductIds.invalidate();
      toast.success("Wishlist cleared");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to clear wishlist");
    },
  });

  const handleClear = () => {
    clearMutation.mutate();
  };

  if (!isMounted || isLoading) {
    return (
      <FadeIn>
        <Card className="border border-black/5 bg-white/80">
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="text-brand-1 h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  if (error?.data?.code === "UNAUTHORIZED") {
    return (
      <FadeIn>
        <Card className="border border-black/5 bg-white/80">
          <CardContent className="py-16 text-center">
            <Heart className="text-muted-3 mx-auto mb-4 h-12 w-12" />
            <h3 className="font-display text-ink-1 text-lg">
              Sign in to view your wishlist
            </h3>
            <p className="text-muted-1 mt-1">Save items you love for later</p>
            <Button
              className="bg-brand-1 hover:bg-brand-2 mt-6 rounded-full"
              asChild
            >
              <Link href="/auth/signin?callbackUrl=/account/wishlist">
                Sign In
              </Link>
            </Button>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  const items = wishlistData?.items ?? [];

  return (
    <FadeIn>
      <Card className="overflow-hidden rounded-2xl border border-black/5 bg-white/80 shadow-[0_20px_50px_rgba(15,15,15,0.08)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-ink-1 flex items-center gap-2 text-xl">
                <Heart className="text-danger-1 h-5 w-5" />
                My Wishlist
              </CardTitle>
              <CardDescription className="text-muted-1">
                {items.length} item{items.length !== 1 ? "s" : ""} saved for
                later
              </CardDescription>
            </div>
            {items.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={clearMutation.isPending}
                    className="text-ink-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
                  >
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Wishlist</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to clear your wishlist? This will
                      remove all {items.length} item
                      {items.length !== 1 ? "s" : ""} from your wishlist.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClear}
                      className="bg-danger-1 hover:bg-danger-2"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <div className="bg-paper-1 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Heart className="text-muted-3 h-8 w-8" />
              </div>
              <h3 className="font-display text-ink-1 text-lg">
                Your wishlist is empty
              </h3>
              <p className="text-muted-1 mt-1">Save items you like for later</p>
              <Button
                className="bg-brand-1 hover:bg-brand-2 mt-4 rounded-full"
                asChild
              >
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Browse Products
                </Link>
              </Button>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <StaggerItem key={item.id}>
                  <ProductCard
                    product={{
                      ...item.product,
                      images:
                        item.product.images?.map((img) => ({
                          url: img.url,
                          alt: null,
                        })) ?? [],
                    }}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}
