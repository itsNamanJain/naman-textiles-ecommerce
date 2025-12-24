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
  PackagePlus,
  Check,
  X,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  const [stockEditProduct, setStockEditProduct] = useState<{
    id: string;
    name: string;
    currentStock: number;
  } | null>(null);
  const [newStockValue, setNewStockValue] = useState("");

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

  const updateStockMutation = api.admin.updateStock.useMutation({
    onSuccess: () => {
      toast.success("Stock updated successfully");
      utils.admin.getProducts.invalidate();
      setStockEditProduct(null);
      setNewStockValue("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update stock");
    },
  });

  const handleToggleStatus = (productId: string) => {
    toggleStatusMutation.mutate({ productId });
  };

  const handleOpenStockEdit = (product: {
    id: string;
    name: string;
    stockQuantity: string;
  }) => {
    setStockEditProduct({
      id: product.id,
      name: product.name,
      currentStock: Number(product.stockQuantity),
    });
    setNewStockValue(product.stockQuantity);
  };

  const handleUpdateStock = () => {
    if (!stockEditProduct) return;
    const stockValue = Number(newStockValue);
    if (isNaN(stockValue) || stockValue < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }
    updateStockMutation.mutate({
      productId: stockEditProduct.id,
      stockQuantity: stockValue,
    });
  };

  const products = data?.products ?? [];
  const categories = categoriesData ?? [];

  // Client-side search filter
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="mt-1 text-gray-500">Manage your product catalog</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
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
            >
              <Zap className="mr-2 h-4 w-4" />
              Quick Add
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
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
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search products by name, SKU..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No products found
              </div>
            ) : (
              <StaggerContainer className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredProducts.map((product) => (
                  <StaggerItem key={product.id}>
                    <div className="rounded-lg border p-3 transition-shadow hover:shadow-md">
                      {/* Product Image - Smaller aspect ratio */}
                      <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
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
                            <ImageIcon className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                        {!product.isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Badge
                              variant="secondary"
                              className="bg-red-100 text-xs text-red-800"
                            >
                              Inactive
                            </Badge>
                          </div>
                        )}
                        {product.isFeatured && (
                          <Badge className="absolute top-1 left-1 bg-amber-500 text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>

                      {/* Product Info - More compact */}
                      <div className="space-y-1">
                        <h3 className="line-clamp-1 text-sm font-medium">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {product.category?.name}
                        </p>

                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-amber-600">
                            {formatPrice(Number(product.price))}
                            <span className="text-xs font-normal text-gray-500">
                              /{product.unit}
                            </span>
                          </p>
                          <button
                            onClick={() => handleOpenStockEdit(product)}
                            className="rounded px-1.5 py-0.5 text-xs transition-colors hover:bg-gray-100"
                            title="Click to edit stock"
                          >
                            <span
                              className={
                                Number(product.stockQuantity) <=
                                Number(product.lowStockThreshold)
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }
                            >
                              Stock: {product.stockQuantity}
                            </span>
                          </button>
                        </div>

                        {/* Actions - Compact icon buttons */}
                        <div className="flex gap-1 pt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
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
                            className="h-7 w-7"
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
                            className="h-7 w-7"
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
                            className="h-7 w-7"
                            onClick={() => handleToggleStatus(product.id)}
                            disabled={toggleStatusMutation.isPending}
                            title={product.isActive ? "Deactivate" : "Activate"}
                          >
                            {product.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
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

      {/* Stock Edit Dialog */}
      <Dialog
        open={!!stockEditProduct}
        onOpenChange={(open) => !open && setStockEditProduct(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5" />
              Update Stock
            </DialogTitle>
          </DialogHeader>
          {stockEditProduct && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{stockEditProduct.name}</p>
                <p className="text-sm text-gray-500">
                  Current stock: {stockEditProduct.currentStock}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">New Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(e.target.value)}
                  placeholder="Enter new stock quantity"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStockEditProduct(null)}
              disabled={updateStockMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStock}
              disabled={updateStockMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {updateStockMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
