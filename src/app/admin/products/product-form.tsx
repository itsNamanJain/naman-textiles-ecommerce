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
  shortDescription: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  comparePrice: z.coerce.number().optional(),
  costPrice: z.coerce.number().optional(),
  sellingMode: z.enum(["meter", "piece"]),
  unit: z.enum(["meter", "yard", "piece", "set", "kg"]),
  minOrderQuantity: z.coerce.number().positive(),
  quantityStep: z.coerce.number().positive(),
  maxOrderQuantity: z.coerce.number().optional(),
  sku: z.string().optional(),
  fabricType: z.string().optional(),
  material: z.string().optional(),
  width: z.string().optional(),
  weight: z.string().optional(),
  color: z.string().optional(),
  pattern: z.string().optional(),
  composition: z.string().optional(),
  stockQuantity: z.coerce.number(),
  lowStockThreshold: z.coerce.number(),
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
  shortDescription: string | null;
  price: string;
  comparePrice: string | null;
  costPrice: string | null;
  sellingMode: "meter" | "piece";
  unit: "meter" | "yard" | "piece" | "set" | "kg";
  minOrderQuantity: string;
  quantityStep: string;
  maxOrderQuantity: string | null;
  sku: string | null;
  fabricType: string | null;
  material: string | null;
  width: string | null;
  weight: string | null;
  color: string | null;
  pattern: string | null;
  composition: string | null;
  stockQuantity: string;
  lowStockThreshold: string;
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
      unit: "meter",
      minOrderQuantity: 1,
      quantityStep: 0.5,
      stockQuantity: 0,
      lowStockThreshold: 10,
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
      shortDescription: product.shortDescription ?? "",
      price: Number(product.price),
      comparePrice: product.comparePrice
        ? Number(product.comparePrice)
        : undefined,
      costPrice: product.costPrice ? Number(product.costPrice) : undefined,
      sellingMode: product.sellingMode,
      unit: product.unit,
      minOrderQuantity: Number(product.minOrderQuantity),
      quantityStep: Number(product.quantityStep),
      maxOrderQuantity: product.maxOrderQuantity
        ? Number(product.maxOrderQuantity)
        : undefined,
      sku: isDuplicate ? "" : (product.sku ?? ""),
      fabricType: product.fabricType ?? "",
      material: product.material ?? "",
      width: product.width ?? "",
      weight: product.weight ?? "",
      color: product.color ?? "",
      pattern: product.pattern ?? "",
      composition: product.composition ?? "",
      // For duplicate: reset stock to 0
      stockQuantity: isDuplicate ? 0 : Number(product.stockQuantity),
      lowStockThreshold: Number(product.lowStockThreshold),
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
        shortDescription: "",
        price: undefined,
        comparePrice: undefined,
        costPrice: undefined,
        sellingMode: "meter",
        unit: "meter",
        minOrderQuantity: 1,
        quantityStep: 0.5,
        maxOrderQuantity: undefined,
        sku: "",
        fabricType: "",
        material: "",
        width: "",
        weight: "",
        color: "",
        pattern: "",
        composition: "",
        stockQuantity: 0,
        lowStockThreshold: 10,
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
        costPrice: cleanOptionalNumber(data.costPrice, true),
        maxOrderQuantity: cleanOptionalNumber(data.maxOrderQuantity, true),
      });
    } else {
      createMutation.mutate({
        ...data,
        comparePrice:
          cleanOptionalNumber(data.comparePrice, false) ?? undefined,
        costPrice: cleanOptionalNumber(data.costPrice, false) ?? undefined,
        maxOrderQuantity:
          cleanOptionalNumber(data.maxOrderQuantity, false) ?? undefined,
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
        className={`max-h-[90vh] overflow-y-auto ${isQuickAdd ? "max-w-2xl" : "max-w-4xl"}`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {formTitle}
            {isQuickAdd && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-700">
                Quick Mode
              </span>
            )}
            {duplicateProduct && (
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-normal text-blue-700">
                From: {duplicateProduct.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
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
                  <p className="text-sm text-red-500">{errors.name.message}</p>
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
                  <p className="text-sm text-red-500">{errors.slug.message}</p>
                )}
              </div>

              {!isQuickAdd && (
                <>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Input
                      id="shortDescription"
                      {...register("shortDescription")}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      rows={4}
                    />
                  </div>
                </>
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
                  <p className="text-sm text-red-500">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {!isQuickAdd && (
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" {...register("sku")} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing & Selling</CardTitle>
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
                  <p className="text-sm text-red-500">{errors.price.message}</p>
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
                    <p className="text-xs text-gray-500">
                      Original price before discount
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost Price (Optional)</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      placeholder="For profit calculation"
                      {...register("costPrice")}
                    />
                    <p className="text-xs text-gray-500">Your purchase cost</p>
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

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={watch("unit")}
                  onValueChange={(
                    value: "meter" | "yard" | "piece" | "set" | "kg"
                  ) => setValue("unit", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meter">Meter</SelectItem>
                    <SelectItem value="yard">Yard</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="set">Set</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isQuickAdd && (
                <div className="space-y-2">
                  <Label htmlFor="minOrderQuantity">Min Order Qty</Label>
                  <Input
                    id="minOrderQuantity"
                    type="number"
                    step="0.5"
                    {...register("minOrderQuantity")}
                  />
                </div>
              )}

              {!isQuickAdd && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="quantityStep">Quantity Step</Label>
                    <Input
                      id="quantityStep"
                      type="number"
                      step="0.1"
                      {...register("quantityStep")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxOrderQuantity">
                      Max Order Qty (Optional)
                    </Label>
                    <Input
                      id="maxOrderQuantity"
                      type="number"
                      step="0.5"
                      placeholder="No limit"
                      {...register("maxOrderQuantity")}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Fabric Details - Hidden in Quick Add */}
          {!isQuickAdd && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fabric Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="fabricType">Fabric Type</Label>
                  <Input id="fabricType" {...register("fabricType")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input id="material" {...register("material")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="composition">Composition</Label>
                  <Input
                    id="composition"
                    {...register("composition")}
                    placeholder="e.g., 100% Cotton"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    {...register("width")}
                    placeholder="e.g., 44 inches"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    {...register("weight")}
                    placeholder="e.g., 150 GSM"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" {...register("color")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pattern">Pattern</Label>
                  <Input id="pattern" {...register("pattern")} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inventory - Simplified in Quick Add */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inventory</CardTitle>
            </CardHeader>
            <CardContent
              className={`grid gap-4 ${isQuickAdd ? "md:grid-cols-1" : "md:grid-cols-2"}`}
            >
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  step="0.5"
                  placeholder="e.g., 100"
                  {...register("stockQuantity")}
                />
              </div>

              {!isQuickAdd && (
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    {...register("lowStockThreshold")}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images - Show for new products and duplicates */}
          {!editProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddImage}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
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
                          className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white"
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700"
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
