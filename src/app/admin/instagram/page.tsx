"use client";

import { useState } from "react";
import { Instagram, Plus, Trash2 } from "lucide-react";

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

export default function AdminInstagramPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingReelId, setDeletingReelId] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  const utils = api.useUtils();

  const { data: reels, isLoading } = api.instagram.getAll.useQuery();

  const createMutation = api.instagram.create.useMutation({
    onSuccess: () => {
      toast.success("Reel added");
      setIsAddDialogOpen(false);
      setUrl("");
      utils.instagram.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add reel");
    },
  });

  const deleteMutation = api.instagram.delete.useMutation({
    onSuccess: () => {
      toast.success("Reel deleted");
      setIsDeleteDialogOpen(false);
      setDeletingReelId(null);
      utils.instagram.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete reel");
    },
  });

  const handleAdd = () => {
    if (!url.trim()) {
      toast.error("Reel URL is required");
      return;
    }
    createMutation.mutate({ url: url.trim() });
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
            onClick={() => {
              setUrl("");
              setIsAddDialogOpen(true);
            }}
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
                      <TableHead className="text-muted-2">#</TableHead>
                      <TableHead className="text-muted-2">URL</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reels.map((reel, index) => (
                      <TableRow key={reel.id}>
                        <TableCell className="text-muted-2 w-12">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <a
                            href={reel.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-3 block max-w-[400px] truncate text-sm hover:underline"
                          >
                            {reel.url}
                          </a>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-danger-4 hover:bg-danger-1 hover:text-danger-5 rounded-full border-black/10"
                            onClick={() => {
                              setDeletingReelId(reel.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg border border-black/5 bg-white/90">
          <DialogHeader>
            <DialogTitle className="font-display text-ink-1">
              Add Reel
            </DialogTitle>
            <DialogDescription>
              Paste the Instagram reel URL.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="url">Reel URL</Label>
            <Input
              id="url"
              placeholder="https://www.instagram.com/reel/..."
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="rounded-full border-black/10 bg-white/80"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={createMutation.isPending}
              className="bg-ink-1 text-paper-1 hover:bg-ink-0 rounded-full"
            >
              Add Reel
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
