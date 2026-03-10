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
import { api } from "@/trpc/react";

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

  // Fetch filter options from DB
  const { data: filterOptions } = api.product.getFilterOptions.useQuery();

  // Sync state with URL params after mount
  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") ?? "");
    setMaxPrice(searchParams.get("maxPrice") ?? "");
  }, [searchParams]);

  const currentSort = searchParams.get("sort") ?? "newest";
  const currentMode = searchParams.get("mode") ?? "all";
  const currentColor = searchParams.get("color") ?? "all";
  const currentFabricType = searchParams.get("fabricType") ?? "all";

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

  const handleColorChange = (value: string) => {
    updateFilters({ color: value });
  };

  const handleFabricTypeChange = (value: string) => {
    updateFilters({ fabricType: value });
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
    searchParams.get("mode") ||
    searchParams.get("color") ||
    searchParams.get("fabricType");

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

      {/* Color Filter (Desktop) */}
      {filterOptions?.colors && filterOptions.colors.length > 0 && (
        <div className="hidden lg:block">
          <Select value={currentColor} onValueChange={handleColorChange}>
            <SelectTrigger className="w-[160px] rounded-full border-black/10 bg-white/80 text-sm">
              <SelectValue placeholder="Color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colors</SelectItem>
              {filterOptions.colors.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Fabric Type Filter (Desktop) */}
      {filterOptions?.fabricTypes && filterOptions.fabricTypes.length > 0 && (
        <div className="hidden lg:block">
          <Select
            value={currentFabricType}
            onValueChange={handleFabricTypeChange}
          >
            <SelectTrigger className="w-[160px] rounded-full border-black/10 bg-white/80 text-sm">
              <SelectValue placeholder="Fabric Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fabrics</SelectItem>
              {filterOptions.fabricTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Filters Sheet (Mobile + Advanced) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="text-ink-1 gap-2 rounded-full border-black/10 bg-white/80 hover:bg-white"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-brand-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
                !
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-ink-1 text-xl">
              Filters
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Price Range */}
            <div>
              <Label className="text-ink-1 text-sm font-semibold">
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
                <span className="text-muted-3">-</span>
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
              <Label className="text-ink-1 text-sm font-semibold">
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
                        ? "bg-brand-1 hover:bg-brand-2 rounded-full"
                        : "rounded-full border-black/10 bg-white/80"
                    }
                  >
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="md:hidden" />

            {/* Color Filter (Sheet) */}
            {filterOptions?.colors && filterOptions.colors.length > 0 && (
              <>
                <div>
                  <Label className="text-ink-1 text-sm font-semibold">
                    Color
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      variant={currentColor === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleColorChange("all")}
                      className={
                        currentColor === "all"
                          ? "bg-brand-1 hover:bg-brand-2 rounded-full"
                          : "rounded-full border-black/10 bg-white/80"
                      }
                    >
                      All
                    </Button>
                    {filterOptions.colors.map((color) => (
                      <Button
                        key={color}
                        variant={
                          currentColor === color ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleColorChange(color)}
                        className={
                          currentColor === color
                            ? "bg-brand-1 hover:bg-brand-2 rounded-full"
                            : "rounded-full border-black/10 bg-white/80"
                        }
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Fabric Type Filter (Sheet) */}
            {filterOptions?.fabricTypes &&
              filterOptions.fabricTypes.length > 0 && (
                <>
                  <div>
                    <Label className="text-ink-1 text-sm font-semibold">
                      Fabric Type
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        variant={
                          currentFabricType === "all" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleFabricTypeChange("all")}
                        className={
                          currentFabricType === "all"
                            ? "bg-brand-1 hover:bg-brand-2 rounded-full"
                            : "rounded-full border-black/10 bg-white/80"
                        }
                      >
                        All
                      </Button>
                      {filterOptions.fabricTypes.map((type) => (
                        <Button
                          key={type}
                          variant={
                            currentFabricType === type ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handleFabricTypeChange(type)}
                          className={
                            currentFabricType === type
                              ? "bg-brand-1 hover:bg-brand-2 rounded-full"
                              : "rounded-full border-black/10 bg-white/80"
                          }
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="text-ink-1 flex-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
                onClick={clearFilters}
              >
                Clear All
              </Button>
              <Button
                className="bg-brand-1 hover:bg-brand-2 flex-1 rounded-full"
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
              className="bg-paper-1 text-ink-2 h-7 gap-1 rounded-full text-xs"
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
              className="bg-paper-1 text-ink-2 h-7 gap-1 rounded-full text-xs"
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
              className="bg-paper-1 text-ink-2 h-7 gap-1 rounded-full text-xs"
              onClick={() => handleModeChange("all")}
            >
              {currentMode === "meter" ? "By Meter" : "By Piece"}
              <X className="h-3 w-3" />
            </Button>
          )}
          {currentColor !== "all" && (
            <Button
              variant="secondary"
              size="sm"
              className="bg-paper-1 text-ink-2 h-7 gap-1 rounded-full text-xs"
              onClick={() => handleColorChange("all")}
            >
              Color: {currentColor}
              <X className="h-3 w-3" />
            </Button>
          )}
          {currentFabricType !== "all" && (
            <Button
              variant="secondary"
              size="sm"
              className="bg-paper-1 text-ink-2 h-7 gap-1 rounded-full text-xs"
              onClick={() => handleFabricTypeChange("all")}
            >
              Fabric: {currentFabricType}
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
