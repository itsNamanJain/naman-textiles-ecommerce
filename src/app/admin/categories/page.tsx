"use client";

import { useState } from "react";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
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
    setFormData({ name: "", slug: "", description: "" });
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
    });
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
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
            <h1 className="font-display text-ink-1 text-2xl">Categories</h1>
            <p className="text-muted-1 mt-1">
              Organize your products into categories
            </p>
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
            <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button className="bg-ink-1 text-paper-1 hover:bg-ink-0 rounded-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="border border-black/5 bg-white/90">
                <DialogHeader>
                  <DialogTitle className="font-display text-ink-1">
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
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    className="rounded-full border-black/10 bg-white/80"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-ink-1 text-paper-1 hover:bg-ink-0 rounded-full"
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
        <Card className="border border-black/5 bg-white/80">
          <CardHeader>
            <CardTitle className="font-display text-ink-1 flex items-center gap-2 text-xl">
              <FolderTree className="h-5 w-5" />
              Categories ({categories?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-brand-1 h-8 w-8 animate-spin" />
              </div>
            ) : !categories || categories.length === 0 ? (
              <div className="text-muted-2 py-12 text-center">
                No categories found. Create your first category!
              </div>
            ) : (
              <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <StaggerItem key={category.id}>
                    <div className="rounded-2xl border border-black/10 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      {/* Category Info */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-ink-1 font-medium">
                              {category.name}
                            </h3>
                            <p className="text-muted-2 text-sm">
                              /{category.slug}
                            </p>
                          </div>
                        </div>

                        {category.description && (
                          <p className="text-muted-2 line-clamp-2 text-sm">
                            {category.description}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-paper-1 flex-1 rounded-full border-black/10 bg-white/80"
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
                                className="text-danger-4 hover:bg-danger-1 hover:text-danger-4 rounded-full border-black/10"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border border-black/5 bg-white/95">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Category
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;
                                  {category.name}&quot;? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category.id)}
                                  className="bg-danger-4 hover:bg-danger-5 text-white"
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
