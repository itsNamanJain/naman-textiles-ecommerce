"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Loader2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  ImageIcon,
  Copy,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { formatPrice } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ProductForm } from "./product-form";

export default function AdminProductsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [duplicatingProduct, setDuplicatingProduct] = useState<string | null>(
    null
  );
  const [isQuickAdd, setIsQuickAdd] = useState(false);

  const utils = api.useUtils();

  const { data, isLoading, refetch } = api.admin.getProducts.useQuery({
    limit: 50,
    categoryId: categoryFilter === "all" ? undefined : categoryFilter,
  });

  const { data: categoriesData } = api.admin.getCategories.useQuery();

  const toggleStatusMutation = api.admin.toggleProductStatus.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.isActive ? "Product activated" : "Product deactivated"
      );
      utils.admin.getProducts.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  const handleToggleStatus = (productId: string) => {
    toggleStatusMutation.mutate({ productId });
  };

  const products = data?.products ?? [];
  const categories = categoriesData ?? [];

  // Client-side search filter
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-ink-1 text-2xl">Products</h1>
            <p className="text-muted-1 mt-1">Manage your product catalog</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-ink-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingProduct(null);
                setDuplicatingProduct(null);
                setIsQuickAdd(true);
                setIsFormOpen(true);
              }}
              className="bg-paper-1 text-ink-1 hover:bg-paper-2 rounded-full border-black/10"
            >
              <Zap className="mr-2 h-4 w-4" />
              Quick Add
            </Button>
            <Button
              className="bg-ink-1 text-paper-1 hover:bg-ink-0 rounded-full"
              onClick={() => {
                setEditingProduct(null);
                setDuplicatingProduct(null);
                setIsQuickAdd(false);
                setIsFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.1}>
        <Card className="border border-black/5 bg-white/80">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-2 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search products by name..."
                  className="rounded-2xl border-black/10 bg-white/80 pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full rounded-full border-black/10 bg-white/80 sm:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Products Grid */}
      <FadeIn delay={0.2}>
        <Card className="border border-black/5 bg-white/80">
          <CardHeader>
            <CardTitle className="font-display text-ink-1 flex items-center gap-2 text-xl">
              <Package className="h-5 w-5" />
              Products ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-brand-1 h-8 w-8 animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-muted-2 py-12 text-center">
                No products found
              </div>
            ) : (
              <StaggerContainer className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredProducts.map((product) => (
                  <StaggerItem key={product.id}>
                    <div className="rounded-2xl border border-black/10 bg-white/90 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      {/* Product Image - Smaller aspect ratio */}
                      <div className="bg-paper-2 relative mb-2 aspect-[4/3] overflow-hidden rounded-xl">
                        {product.images?.[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageIcon className="text-muted-3 h-8 w-8" />
                          </div>
                        )}
                        {!product.isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Badge
                              variant="secondary"
                              className="bg-danger-2 text-danger-4 text-xs"
                            >
                              Inactive
                            </Badge>
                          </div>
                        )}
                        {product.isFeatured && (
                          <Badge className="bg-paper-1 text-brand-3 absolute top-1 left-1 text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>

                      {/* Product Info - More compact */}
                      <div className="space-y-1">
                        <h3 className="text-ink-1 line-clamp-1 text-sm font-semibold">
                          {product.name}
                        </h3>
                        <p className="text-muted-2 text-xs">
                          {product.category?.name}
                        </p>

                        <div className="flex items-center justify-between">
                          <p className="text-brand-3 text-sm font-bold">
                            {formatPrice(Number(product.price))}
                          </p>
                        </div>

                        {/* Actions - Compact icon buttons */}
                        <div className="flex gap-1 pt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="hover:bg-paper-1 h-8 w-8 rounded-full border-black/10 bg-white/80"
                            asChild
                            title="View"
                          >
                            <Link href={`/product/${product.slug}`}>
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="hover:bg-paper-1 h-8 w-8 rounded-full border-black/10 bg-white/80"
                            onClick={() => {
                              setEditingProduct(product.id);
                              setDuplicatingProduct(null);
                              setIsQuickAdd(false);
                              setIsFormOpen(true);
                            }}
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="hover:bg-paper-1 h-8 w-8 rounded-full border-black/10 bg-white/80"
                            onClick={() => {
                              setEditingProduct(null);
                              setDuplicatingProduct(product.id);
                              setIsQuickAdd(false);
                              setIsFormOpen(true);
                            }}
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleToggleStatus(product.id)}
                            disabled={toggleStatusMutation.isPending}
                            title={product.isActive ? "Deactivate" : "Activate"}
                          >
                            {product.isActive ? (
                              <ToggleRight className="text-success-1 h-4 w-4" />
                            ) : (
                              <ToggleLeft className="text-muted-3 h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Product Form Modal */}
      <ProductForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingProduct(null);
            setDuplicatingProduct(null);
            setIsQuickAdd(false);
          }
        }}
        editProduct={
          editingProduct
            ? products.find((p) => p.id === editingProduct)
            : undefined
        }
        duplicateProduct={
          duplicatingProduct
            ? products.find((p) => p.id === duplicatingProduct)
            : undefined
        }
        isQuickAdd={isQuickAdd}
      />
    </div>
  );
}
