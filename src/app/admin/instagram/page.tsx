"use client";

import { useState } from "react";
import Image from "next/image";
import { Instagram, Plus, Pencil, Trash2 } from "lucide-react";

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

type ReelFormData = {
  url: string;
  title: string;
  thumbnailUrl: string;
  position: string;
  isActive: boolean;
};

const initialFormData: ReelFormData = {
  url: "",
  title: "",
  thumbnailUrl: "",
  position: "0",
  isActive: true,
};

export default function AdminInstagramPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingReelId, setEditingReelId] = useState<string | null>(null);
  const [deletingReelId, setDeletingReelId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ReelFormData>(initialFormData);

  const utils = api.useUtils();

  const { data: reels, isLoading } = api.instagram.getAll.useQuery();

  const createMutation = api.instagram.create.useMutation({
    onSuccess: () => {
      toast.success("Reel added");
      setIsDialogOpen(false);
      setFormData(initialFormData);
      utils.instagram.getAll.invalidate();
      utils.instagram.getActive.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add reel");
    },
  });

  const updateMutation = api.instagram.update.useMutation({
    onSuccess: () => {
      toast.success("Reel updated");
      setIsDialogOpen(false);
      setEditingReelId(null);
      setFormData(initialFormData);
      utils.instagram.getAll.invalidate();
      utils.instagram.getActive.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update reel");
    },
  });

  const deleteMutation = api.instagram.delete.useMutation({
    onSuccess: () => {
      toast.success("Reel deleted");
      setIsDeleteDialogOpen(false);
      setDeletingReelId(null);
      utils.instagram.getAll.invalidate();
      utils.instagram.getActive.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete reel");
    },
  });

  const openCreateDialog = () => {
    setEditingReelId(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (reelId: string) => {
    const reel = reels?.find((item) => item.id === reelId);
    if (!reel) {
      toast.error("Reel not found");
      return;
    }

    setEditingReelId(reelId);
    setFormData({
      url: reel.url,
      title: reel.title ?? "",
      thumbnailUrl: reel.thumbnailUrl,
      position: String(reel.position ?? 0),
      isActive: reel.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (reelId: string) => {
    setDeletingReelId(reelId);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.url.trim() || !formData.thumbnailUrl.trim()) {
      toast.error("Reel URL and thumbnail URL are required");
      return;
    }

    const payload = {
      url: formData.url.trim(),
      title: formData.title.trim(),
      thumbnailUrl: formData.thumbnailUrl.trim(),
      position: Number.parseInt(formData.position || "0", 10),
      isActive: formData.isActive,
    };

    if (editingReelId) {
      updateMutation.mutate({ id: editingReelId, ...payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const handleDelete = () => {
    if (!deletingReelId) return;
    deleteMutation.mutate({ id: deletingReelId });
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-ink-1 text-2xl">
              Instagram Reels
            </h1>
            <p className="text-muted-1 mt-1">
              Manage Instagram reels displayed on the homepage
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-ink-1 text-paper-1 hover:bg-ink-0 rounded-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Reel
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card className="border border-black/5 bg-white/80">
          <CardHeader>
            <CardTitle className="font-display text-ink-1 flex items-center gap-2 text-xl">
              <Instagram className="h-5 w-5" />
              All Reels
              {reels && (
                <Badge className="bg-paper-1 text-brand-3 ml-2">
                  {reels.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-muted-2 flex items-center justify-center py-12">
                Loading reels...
              </div>
            ) : !reels || reels.length === 0 ? (
              <div className="text-muted-2 py-12 text-center">
                No reels added yet. Add your first Instagram reel.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-muted-2">Thumbnail</TableHead>
                      <TableHead className="text-muted-2">Title</TableHead>
                      <TableHead className="text-muted-2">Status</TableHead>
                      <TableHead className="text-muted-2">Position</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reels.map((reel) => (
                      <TableRow key={reel.id}>
                        <TableCell>
                          <div className="relative h-16 w-9 overflow-hidden rounded">
                            <Image
                              src={reel.thumbnailUrl}
                              alt={reel.title || "Reel"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-ink-1 max-w-[200px] truncate font-medium">
                              {reel.title || "Untitled"}
                            </p>
                            <p className="text-muted-2 max-w-[200px] truncate text-xs">
                              {reel.url}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              reel.isActive
                                ? "bg-success-2 text-success-1"
                                : "bg-gray-1 text-gray-2"
                            }
                          >
                            {reel.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{reel.position}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-paper-1 rounded-full border-black/10 bg-white/80"
                              onClick={() => openEditDialog(reel.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-danger-4 hover:bg-danger-1 hover:text-danger-5 rounded-full border-black/10"
                              onClick={() => openDeleteDialog(reel.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl border border-black/5 bg-white/90">
          <DialogHeader>
            <DialogTitle className="font-display text-ink-1">
              {editingReelId ? "Edit Reel" : "Add Reel"}
            </DialogTitle>
            <DialogDescription>
              Enter the Instagram reel URL and a thumbnail image URL.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="url">Reel URL</Label>
              <Input
                id="url"
                placeholder="https://www.instagram.com/reel/..."
                value={formData.url}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    url: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="Fabric showcase, styling tips, etc."
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
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                placeholder="https://res.cloudinary.com/..."
                value={formData.thumbnailUrl}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    thumbnailUrl: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="flex items-end gap-3 pb-1">
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
              {editingReelId ? "Save Changes" : "Add Reel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="border border-black/5 bg-white/95">
          <DialogHeader>
            <DialogTitle>Delete reel?</DialogTitle>
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
