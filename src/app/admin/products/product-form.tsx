"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  comparePrice: z.coerce.number().optional(),
  sellingMode: z.enum(["meter", "piece"]),
  minOrderQuantity: z.coerce.number().positive(),
  categoryId: z.string().min(1, "Category is required"),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

type ProductData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  comparePrice: string | null;
  sellingMode: "meter" | "piece";
  minOrderQuantity: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  images?: { id: string; url: string; alt?: string | null }[];
};

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProduct?: ProductData;
  duplicateProduct?: ProductData;
  isQuickAdd?: boolean;
}

export function ProductForm({
  open,
  onOpenChange,
  editProduct,
  duplicateProduct,
  isQuickAdd = false,
}: ProductFormProps) {
  const utils = api.useUtils();
  const [images, setImages] = useState<{ url: string; alt?: string }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const { data: categories } = api.admin.getCategories.useQuery();

  const createMutation = api.admin.createProduct.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully");
      utils.admin.getProducts.invalidate();
      onOpenChange(false);
      reset();
      setImages([]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  const updateMutation = api.admin.updateProduct.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      utils.admin.getProducts.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sellingMode: "meter",
      minOrderQuantity: 1,
      isActive: true,
      isFeatured: false,
    },
  });

  // Helper to populate form from product data
  const populateFormFromProduct = (
    product: ProductData,
    isDuplicate = false
  ) => {
    reset({
      // For duplicate: empty name/slug so user must enter new ones
      name: isDuplicate ? `${product.name} (Copy)` : product.name,
      slug: isDuplicate ? "" : product.slug,
      description: product.description ?? "",
      price: Number(product.price),
      comparePrice: product.comparePrice
        ? Number(product.comparePrice)
        : undefined,
      sellingMode: product.sellingMode,
      minOrderQuantity: Number(product.minOrderQuantity),
      categoryId: product.categoryId,
      isActive: isDuplicate ? true : product.isActive,
      isFeatured: isDuplicate ? false : product.isFeatured,
    });
    setImages(
      product.images?.map((img) => ({
        url: img.url,
        alt: img.alt ?? undefined,
      })) ?? []
    );
  };

  // Reset form when editProduct/duplicateProduct changes
  useEffect(() => {
    if (editProduct) {
      populateFormFromProduct(editProduct, false);
    } else if (duplicateProduct) {
      populateFormFromProduct(duplicateProduct, true);
    } else {
      // New product - use defaults
      reset({
        name: "",
        slug: "",
        description: "",
        price: undefined,
        comparePrice: undefined,
        sellingMode: "meter",
        minOrderQuantity: 1,
        categoryId: "",
        isActive: true,
        isFeatured: false,
      });
      setImages([]);
    }
  }, [editProduct, duplicateProduct, reset]);

  const onSubmit = (data: ProductFormData) => {
    // For optional number fields:
    // - Create: convert 0/NaN/negative to undefined (don't include in request)
    // - Update: convert 0/NaN/negative to null (explicitly clear the field)
    const cleanOptionalNumber = (
      val: number | undefined,
      forUpdate: boolean
    ): number | null | undefined => {
      if (val === undefined || val === null || isNaN(val) || val <= 0) {
        return forUpdate ? null : undefined;
      }
      return val;
    };

    if (editProduct) {
      updateMutation.mutate({
        id: editProduct.id,
        ...data,
        comparePrice: cleanOptionalNumber(data.comparePrice, true),
      });
    } else {
      createMutation.mutate({
        ...data,
        comparePrice:
          cleanOptionalNumber(data.comparePrice, false) ?? undefined,
        images: images.length > 0 ? images : undefined,
      });
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, { url: newImageUrl.trim() }]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Determine form title
  const formTitle = editProduct
    ? "Edit Product"
    : duplicateProduct
      ? "Duplicate Product"
      : isQuickAdd
        ? "Quick Add Product"
        : "Add New Product";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-h-[90vh] overflow-y-auto border border-black/5 bg-white/95 ${isQuickAdd ? "max-w-2xl" : "max-w-4xl"}`}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-ink-1 flex items-center gap-2">
            {formTitle}
            {isQuickAdd && (
              <span className="bg-paper-1 text-brand-3 rounded-full px-3 py-1 text-xs font-normal">
                Quick Mode
              </span>
            )}
            {duplicateProduct && (
              <span className="bg-indigo-2 text-indigo-1 rounded-full px-3 py-1 text-xs font-normal">
                From: {duplicateProduct.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card className="border border-black/5 bg-white/80">
            <CardHeader>
              <CardTitle className="text-ink-1 text-lg">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Premium Cotton Fabric"
                  {...register("name")}
                  onChange={(e) => {
                    register("name").onChange(e);
                    if (!editProduct) {
                      setValue("slug", generateSlug(e.target.value));
                    }
                  }}
                />
                {errors.name && (
                  <p className="text-danger-4 text-sm">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="auto-generated-from-name"
                  {...register("slug")}
                />
                {errors.slug && (
                  <p className="text-danger-4 text-sm">{errors.slug.message}</p>
                )}
              </div>

              {!isQuickAdd && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    rows={4}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  value={watch("categoryId")}
                  onValueChange={(value) => setValue("categoryId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-danger-4 text-sm">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border border-black/5 bg-white/80">
            <CardHeader>
              <CardTitle className="text-ink-1 text-lg">
                Pricing & Selling
              </CardTitle>
            </CardHeader>
            <CardContent
              className={`grid gap-4 ${isQuickAdd ? "md:grid-cols-2" : "md:grid-cols-3"}`}
            >
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 250"
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-danger-4 text-sm">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {!isQuickAdd && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">
                      Compare at Price (Optional)
                    </Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      step="0.01"
                      placeholder="Leave empty if no discount"
                      {...register("comparePrice")}
                    />
                    <p className="text-muted-2 text-xs">
                      Original price before discount
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sellingMode">Selling Mode</Label>
                    <Select
                      value={watch("sellingMode")}
                      onValueChange={(value: "meter" | "piece") =>
                        setValue("sellingMode", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meter">By Meter</SelectItem>
                        <SelectItem value="piece">By Piece</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {!isQuickAdd && (
                <div className="space-y-2">
                  <Label htmlFor="minOrderQuantity">Min Order Qty</Label>
                  <Input
                    id="minOrderQuantity"
                    type="number"
                    step="1"
                    {...register("minOrderQuantity")}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images - Show for new products and duplicates */}
          {!editProduct && (
            <Card className="border border-black/5 bg-white/80">
              <CardHeader>
                <CardTitle className="text-ink-1 text-lg">Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={handleAddImage}
                    className="bg-ink-1 text-paper-1 hover:bg-ink-0 rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <div className="bg-paper-2 relative aspect-square overflow-hidden rounded-2xl">
                          <Image
                            src={img.url}
                            alt={img.alt ?? "Product image"}
                            fill
                            className="object-cover"
                            sizes="100px"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="bg-danger-4 absolute -top-2 -right-2 rounded-full p-1 text-white shadow-sm"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status */}
          <Card className="border border-black/5 bg-white/80">
            <CardHeader>
              <CardTitle className="text-ink-1 text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-8">
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={watch("isActive")}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isFeatured"
                  checked={watch("isFeatured")}
                  onCheckedChange={(checked) => setValue("isFeatured", checked)}
                />
                <Label htmlFor="isFeatured">Featured</Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full border-black/10 bg-white/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-ink-1 text-paper-1 hover:bg-ink-0 rounded-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editProduct ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
