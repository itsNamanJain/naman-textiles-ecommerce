"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  ImageIcon,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
  });

  const utils = api.useUtils();

  const {
    data: categories,
    isLoading,
    refetch,
  } = api.admin.getCategories.useQuery();

  const createMutation = api.admin.createCategory.useMutation({
    onSuccess: () => {
      toast.success("Category created");
      setIsDialogOpen(false);
      resetForm();
      utils.admin.getCategories.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create category");
    },
  });

  const updateMutation = api.admin.updateCategory.useMutation({
    onSuccess: () => {
      toast.success("Category updated");
      setIsDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      utils.admin.getCategories.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update category");
    },
  });

  const deleteMutation = api.admin.deleteCategory.useMutation({
    onSuccess: () => {
      toast.success("Category deleted");
      utils.admin.getCategories.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "", image: "" });
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slugify(name),
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (category: NonNullable<typeof categories>[0]) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image: category.image ?? "",
    });
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image: category.image ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    deleteMutation.mutate({ id: categoryId });
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingCategory(null);
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="mt-1 text-gray-500">
              Organize your products into categories
            </p>
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
            <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory
                      ? "Update the category details below."
                      : "Fill in the details to create a new category."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Category name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      placeholder="category-slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Category description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          image: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={handleSubmit}
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {editingCategory ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </FadeIn>

      {/* Categories Grid */}
      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Categories ({categories?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : !categories || categories.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No categories found. Create your first category!
              </div>
            ) : (
              <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <StaggerItem key={category.id}>
                    <div className="rounded-lg border p-4 transition-shadow hover:shadow-md">
                      {/* Category Image */}
                      <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-gray-100">
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        {!category.isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Badge
                              variant="secondary"
                              className="bg-red-100 text-red-800"
                            >
                              Inactive
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Category Info */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{category.name}</h3>
                            <p className="text-sm text-gray-500">
                              /{category.slug}
                            </p>
                          </div>
                          {category.isActive ? (
                            <ToggleRight className="h-5 w-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                          )}
                        </div>

                        {category.description && (
                          <p className="line-clamp-2 text-sm text-gray-600">
                            {category.description}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Category
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {category.name}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
    </div>
  );
}
