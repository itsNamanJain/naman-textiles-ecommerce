"use client";

import { useState } from "react";
import { CheckCircle2, Trash2, Star, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function AdminReviewsPage() {
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "approved" | "all"
  >("pending");

  const utils = api.useUtils();
  const { data: reviews, isLoading } = api.review.getAll.useQuery({
    status: statusFilter,
  });

  const approveMutation = api.review.setApproval.useMutation({
    onSuccess: () => {
      toast.success("Review updated");
      utils.review.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update review");
    },
  });

  const deleteMutation = api.review.delete.useMutation({
    onSuccess: () => {
      toast.success("Review deleted");
      utils.review.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete review");
    },
  });

  const list = reviews ?? [];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-ink-1 text-2xl">Reviews</h1>
            <p className="text-muted-1 mt-1">
              Approve or remove customer reviews
            </p>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as typeof statusFilter)
            }
          >
            <SelectTrigger className="w-full rounded-full border-black/10 bg-white/80 sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card className="border border-black/5 bg-white/80">
          <CardHeader>
            <CardTitle className="font-display text-ink-1 flex items-center gap-2 text-xl">
              <Star className="h-5 w-5" />
              Reviews ({list.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-brand-1 h-8 w-8 animate-spin" />
              </div>
            ) : list.length === 0 ? (
              <div className="text-muted-2 py-12 text-center">
                No reviews found
              </div>
            ) : (
              <StaggerContainer className="space-y-4">
                {list.map((review) => (
                  <StaggerItem key={review.id}>
                    <div className="rounded-2xl border border-black/10 bg-white/90 p-4 shadow-sm">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="text-ink-1 font-medium">
                              {review.user?.name ?? "Customer"}
                            </p>
                            {review.isVerified && (
                              <Badge className="bg-paper-1 text-brand-3">
                                Verified
                              </Badge>
                            )}
                            {review.isApproved ? (
                              <Badge className="bg-success-2 text-success-1">
                                Approved
                              </Badge>
                            ) : (
                              <Badge className="bg-paper-1 text-brand-3">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <div className="text-brand-3 flex items-center gap-1">
                            {Array.from({ length: review.rating }).map(
                              (_, i) => (
                                <Star key={i} className="h-4 w-4" />
                              )
                            )}
                          </div>
                          {review.title && (
                            <p className="text-ink-1 font-medium">
                              {review.title}
                            </p>
                          )}
                          <p className="text-muted-2 text-sm">
                            {review.comment}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-paper-1 rounded-full border-black/10 bg-white/80"
                            onClick={() =>
                              approveMutation.mutate({
                                id: review.id,
                                isApproved: !review.isApproved,
                              })
                            }
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {review.isApproved ? "Unapprove" : "Approve"}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-danger-4 hover:bg-danger-1 hover:text-danger-5 rounded-full border-black/10"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border border-black/5 bg-white/95">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Review
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the review.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteMutation.mutate({ id: review.id })
                                  }
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
