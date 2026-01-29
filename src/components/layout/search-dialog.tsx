"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2, ImageIcon } from "lucide-react";
import { useDebounce } from "@/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { api } from "@/trpc/react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data: results, isLoading } = api.product.search.useQuery(
    { query: debouncedQuery, limit: 8 },
    { enabled: debouncedQuery.length >= 2 }
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setQuery("");
  }, [onOpenChange]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleClose]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden border border-black/5 bg-white/95 p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-black/5 p-4">
          <DialogTitle className="sr-only">Search Products</DialogTitle>
          <div className="relative">
            <Search className="text-muted-3 absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search fabrics, materials, colors..."
              className="rounded-2xl border-black/10 bg-white/80 pr-10 pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {!query || query.length < 2 ? (
            <div className="text-muted-2 py-8 text-center">
              <Search className="text-muted-3 mx-auto mb-3 h-12 w-12" />
              <p>Start typing to search products</p>
              <p className="text-sm">Minimum 2 characters</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-brand-1 h-8 w-8 animate-spin" />
            </div>
          ) : results && results.length > 0 ? (
            <div className="space-y-2">
              <p className="text-muted-2 mb-3 text-sm">
                Found {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="hover:bg-paper-1 flex items-center gap-4 rounded-2xl border border-black/10 bg-white/80 p-3 transition-colors"
                  onClick={handleClose}
                >
                  <div className="bg-paper-2 relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                    {product.images?.[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="text-muted-3 h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-medium">{product.name}</h4>
                    <p className="text-muted-2 text-sm">
                      {product.category?.name}
                    </p>
                    <p className="text-brand-3 font-semibold">
                      {formatPrice(Number(product.price))}
                      <span className="text-muted-2 text-sm font-normal">
                        /{product.unit}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
              <div className="pt-3 text-center">
                <Link
                  href={`/products?search=${encodeURIComponent(query)}`}
                  className="text-brand-3 text-sm hover:underline"
                  onClick={handleClose}
                >
                  View all results for &quot;{query}&quot;
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-muted-2 py-8 text-center">
              <p>No products found for &quot;{query}&quot;</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
