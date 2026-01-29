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
            <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
            <p className="mt-1 text-gray-500">
              Approve or remove customer reviews
            </p>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as typeof statusFilter)
            }
          >
            <SelectTrigger className="w-full sm:w-48">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Reviews ({list.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : list.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No reviews found
              </div>
            ) : (
              <StaggerContainer className="space-y-4">
                {list.map((review) => (
                  <StaggerItem key={review.id}>
                    <div className="rounded-lg border p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {review.user?.name ?? "Customer"}
                            </p>
                            {review.isVerified && (
                              <Badge variant="secondary">Verified</Badge>
                            )}
                            {review.isApproved ? (
                              <Badge className="bg-green-100 text-green-800">
                                Approved
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: review.rating }).map(
                              (_, i) => (
                                <Star key={i} className="h-4 w-4" />
                              )
                            )}
                          </div>
                          {review.title && (
                            <p className="font-medium text-gray-900">
                              {review.title}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            {review.comment}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
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
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
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
