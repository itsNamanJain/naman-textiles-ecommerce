"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProductFiltersProps = {
  categorySlug?: string;
};

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

const sellingModes = [
  { value: "all", label: "All" },
  { value: "meter", label: "By Meter" },
  { value: "piece", label: "By Piece" },
];

export function ProductFilters({ categorySlug }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize with empty strings to avoid hydration mismatch
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Sync state with URL params after mount
  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") ?? "");
    setMaxPrice(searchParams.get("maxPrice") ?? "");
  }, [searchParams]);

  const currentSort = searchParams.get("sort") ?? "newest";
  const currentMode = searchParams.get("mode") ?? "all";

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const basePath = categorySlug ? `/category/${categorySlug}` : "/products";
    const queryString = params.toString();
    router.push(queryString ? `${basePath}?${queryString}` : basePath);
  };

  const handleSortChange = (value: string) => {
    updateFilters({ sort: value === "newest" ? null : value });
  };

  const handleModeChange = (value: string) => {
    updateFilters({ mode: value });
  };

  const handlePriceFilter = () => {
    updateFilters({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
    });
    setIsOpen(false);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    const basePath = categorySlug ? `/category/${categorySlug}` : "/products";
    router.push(basePath);
    setIsOpen(false);
  };

  const hasActiveFilters =
    searchParams.get("minPrice") ||
    searchParams.get("maxPrice") ||
    searchParams.get("mode");

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Sort Dropdown */}
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[200px] rounded-full border-black/10 bg-white/80 text-sm">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selling Mode Filter (Desktop) */}
      <div className="hidden md:block">
        <Select value={currentMode} onValueChange={handleModeChange}>
          <SelectTrigger className="w-[160px] rounded-full border-black/10 bg-white/80 text-sm">
            <SelectValue placeholder="Selling Mode" />
          </SelectTrigger>
          <SelectContent>
            {sellingModes.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filters Sheet (Mobile + Advanced) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 rounded-full border-black/10 bg-white/80 text-[#2d1c12] hover:bg-white"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#b8743a] text-xs text-white">
                !
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-xl text-[#2d1c12]">
              Filters
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Price Range */}
            <div>
              <Label className="text-sm font-semibold text-[#2d1c12]">
                Price Range
              </Label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-2xl border-black/10 bg-white/80"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-2xl border-black/10 bg-white/80"
                />
              </div>
            </div>

            <Separator />

            {/* Selling Mode (Mobile) */}
            <div className="md:hidden">
              <Label className="text-sm font-semibold text-[#2d1c12]">
                Selling Mode
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {sellingModes.map((mode) => (
                  <Button
                    key={mode.value}
                    variant={currentMode === mode.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleModeChange(mode.value)}
                    className={
                      currentMode === mode.value
                        ? "rounded-full bg-[#b8743a] hover:bg-[#a4632f]"
                        : "rounded-full border-black/10 bg-white/80"
                    }
                  >
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="md:hidden" />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full border-black/10 bg-white/80 text-[#2d1c12] hover:bg-white"
                onClick={clearFilters}
              >
                Clear All
              </Button>
              <Button
                className="flex-1 rounded-full bg-[#b8743a] hover:bg-[#a4632f]"
                onClick={handlePriceFilter}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {searchParams.get("minPrice") && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 gap-1 rounded-full bg-[#f7efe7] text-xs text-[#5c4a3d]"
              onClick={() => {
                setMinPrice("");
                updateFilters({ minPrice: null });
              }}
            >
              Min: {searchParams.get("minPrice")}
              <X className="h-3 w-3" />
            </Button>
          )}
          {searchParams.get("maxPrice") && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 gap-1 rounded-full bg-[#f7efe7] text-xs text-[#5c4a3d]"
              onClick={() => {
                setMaxPrice("");
                updateFilters({ maxPrice: null });
              }}
            >
              Max: {searchParams.get("maxPrice")}
              <X className="h-3 w-3" />
            </Button>
          )}
          {currentMode !== "all" && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 gap-1 rounded-full bg-[#f7efe7] text-xs text-[#5c4a3d]"
              onClick={() => handleModeChange("all")}
            >
              {currentMode === "meter" ? "By Meter" : "By Piece"}
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
