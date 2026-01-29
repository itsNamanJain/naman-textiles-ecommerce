"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Image as ImageIcon, Plus, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FadeIn } from "@/components/ui/motion";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type BannerFormData = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  position: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
};

const initialFormData: BannerFormData = {
  title: "",
  subtitle: "",
  image: "",
  link: "",
  position: "0",
  isActive: true,
  startDate: "",
  endDate: "",
};

export default function AdminBannersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [deletingBannerId, setDeletingBannerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(initialFormData);

  const utils = api.useUtils();

  const { data: banners, isLoading } = api.banner.getAll.useQuery();

  const createMutation = api.banner.create.useMutation({
    onSuccess: () => {
      toast.success("Banner created");
      setIsDialogOpen(false);
      setFormData(initialFormData);
      utils.banner.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create banner");
    },
  });

  const updateMutation = api.banner.update.useMutation({
    onSuccess: () => {
      toast.success("Banner updated");
      setIsDialogOpen(false);
      setEditingBannerId(null);
      setFormData(initialFormData);
      utils.banner.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update banner");
    },
  });

  const deleteMutation = api.banner.delete.useMutation({
    onSuccess: () => {
      toast.success("Banner deleted");
      setIsDeleteDialogOpen(false);
      setDeletingBannerId(null);
      utils.banner.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete banner");
    },
  });

  const openCreateDialog = () => {
    setEditingBannerId(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (bannerId: string) => {
    const banner = banners?.find((item) => item.id === bannerId);
    if (!banner) {
      toast.error("Banner not found");
      return;
    }

    setEditingBannerId(bannerId);
    setFormData({
      title: banner.title ?? "",
      subtitle: banner.subtitle ?? "",
      image: banner.image ?? "",
      link: banner.link ?? "",
      position: String(banner.position ?? 0),
      isActive: banner.isActive ?? true,
      startDate: banner.startDate
        ? dayjs(banner.startDate).format("YYYY-MM-DD")
        : "",
      endDate: banner.endDate ? dayjs(banner.endDate).format("YYYY-MM-DD") : "",
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (bannerId: string) => {
    setDeletingBannerId(bannerId);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.image.trim()) {
      toast.error("Title and image are required");
      return;
    }

    if (formData.startDate && formData.endDate) {
      const start = dayjs(formData.startDate);
      const end = dayjs(formData.endDate);
      if (end.isSame(start) || end.isBefore(start)) {
        toast.error("End date must be after start date");
        return;
      }
    }

    const payload = {
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim() || undefined,
      image: formData.image.trim(),
      link: formData.link.trim() || undefined,
      position: Number.parseInt(formData.position || "0", 10),
      isActive: formData.isActive,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    };

    if (editingBannerId) {
      updateMutation.mutate({ id: editingBannerId, ...payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const handleDelete = () => {
    if (!deletingBannerId) {
      return;
    }

    deleteMutation.mutate({ id: deletingBannerId });
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-ink-1 text-2xl">Banners</h1>
            <p className="text-muted-1 mt-1">
              Create and schedule homepage hero banners
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-ink-1 text-paper-1 hover:bg-ink-0 rounded-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Banner
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card className="border border-black/5 bg-white/80">
          <CardHeader>
            <CardTitle className="font-display text-ink-1 flex items-center gap-2 text-xl">
              <ImageIcon className="h-5 w-5" />
              All Banners
              {banners && (
                <Badge className="bg-paper-1 text-brand-3 ml-2">
                  {banners.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-muted-2 flex items-center justify-center py-12">
                Loading banners...
              </div>
            ) : !banners || banners.length === 0 ? (
              <div className="text-muted-2 py-12 text-center">
                No banners found. Create your first banner.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-muted-2">Title</TableHead>
                      <TableHead className="text-muted-2">Status</TableHead>
                      <TableHead className="text-muted-2">Position</TableHead>
                      <TableHead className="text-muted-2">Schedule</TableHead>
                      <TableHead className="text-muted-2">Image</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners.map((banner) => {
                      const scheduleLabel =
                        banner.startDate || banner.endDate
                          ? `${banner.startDate ? dayjs(banner.startDate).format("MMM D, YYYY") : "Anytime"} → ${banner.endDate ? dayjs(banner.endDate).format("MMM D, YYYY") : "Ongoing"}`
                          : "Always";

                      return (
                        <TableRow key={banner.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-ink-1 font-medium">
                                {banner.title}
                              </p>
                              {banner.subtitle && (
                                <p className="text-muted-2 text-xs">
                                  {banner.subtitle}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                banner.isActive
                                  ? "bg-success-2 text-success-1"
                                  : "bg-gray-1 text-gray-2"
                              }
                            >
                              {banner.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{banner.position}</TableCell>
                          <TableCell className="text-muted-2 text-sm">
                            {scheduleLabel}
                          </TableCell>
                          <TableCell className="text-muted-2 text-sm">
                            {banner.image}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-paper-1 rounded-full border-black/10 bg-white/80"
                                onClick={() => openEditDialog(banner.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-danger-4 hover:bg-danger-1 hover:text-danger-5 rounded-full border-black/10"
                                onClick={() => openDeleteDialog(banner.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl border border-black/5 bg-white/90">
          <DialogHeader>
            <DialogTitle className="font-display text-ink-1">
              {editingBannerId ? "Edit Banner" : "Create Banner"}
            </DialogTitle>
            <DialogDescription>
              Configure the hero banner details and schedule.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    subtitle: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    image: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="link">Link (optional)</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    link: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  min={0}
                  value={formData.position}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      position: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: checked,
                  }))
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-full border-black/10 bg-white/80"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-ink-1 text-paper-1 hover:bg-ink-0 rounded-full"
            >
              {editingBannerId ? "Save Changes" : "Create Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="border border-black/5 bg-white/95">
          <DialogHeader>
            <DialogTitle>Delete banner?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-full border-black/10 bg-white/80"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
