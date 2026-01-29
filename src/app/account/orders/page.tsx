"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, ChevronRight, ShoppingBag, Loader2, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { formatPrice } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-paper-1 text-brand-3",
  confirmed: "bg-info-2 text-info-1",
  processing: "bg-purple-2 text-purple-1",
  shipped: "bg-indigo-2 text-indigo-1",
  delivered: "bg-success-2 text-success-1",
  cancelled: "bg-danger-3 text-danger-4",
  refunded: "bg-gray-1 text-gray-2",
};

export default function OrdersPage() {
  const utils = api.useUtils();
  const [cancelRequestReasons, setCancelRequestReasons] = useState<
    Record<string, string>
  >({});

  const { data, isLoading } = api.order.getUserOrders.useQuery({
    limit: 20,
  });
  const cancelMutation = api.order.cancel.useMutation({
    onSuccess: () => {
      toast.success("Order cancelled");
      utils.order.getUserOrders.invalidate();
      utils.order.getCount.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel order");
    },
  });
  const requestCancellationMutation = api.order.requestCancellation.useMutation(
    {
      onSuccess: () => {
        toast.success("Cancellation request submitted");
        utils.order.getUserOrders.invalidate();
        utils.order.getCount.invalidate();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to submit request");
      },
    }
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="text-brand-1 h-12 w-12 animate-spin" />
        <p className="text-muted-1 mt-4">Loading orders...</p>
      </div>
    );
  }

  const orders = data?.orders ?? [];

  if (orders.length === 0) {
    return (
      <FadeIn>
        <Card className="border border-black/5 bg-white/80">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-paper-1 rounded-full p-6">
                <Package className="text-muted-3 h-12 w-12" />
              </div>
              <h2 className="font-display text-ink-1 mt-4 text-xl">
                No orders yet
              </h2>
              <p className="text-muted-1 mt-2">
                When you place your first order, it will appear here.
              </p>
              <Button
                className="bg-brand-1 hover:bg-brand-2 mt-6 rounded-full"
                asChild
              >
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Start Shopping
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <Card className="border border-black/5 bg-white/80">
        <CardHeader>
          <CardTitle className="font-display text-ink-1 flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            My Orders ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StaggerContainer className="space-y-4">
            {orders.map((order) => (
              <StaggerItem key={order.id}>
                <div className="rounded-2xl border border-black/5 bg-white/70 p-4 transition-colors hover:bg-white">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Order Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-brand-1 font-semibold">
                          #{order.orderNumber}
                        </p>
                        <Badge className={statusColors[order.status]}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-muted-1 text-sm">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-muted-1 text-sm">
                        {order.items.length} item
                        {order.items.length > 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Order Total & Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-ink-1 text-lg font-semibold">
                          {formatPrice(Number(order.total))}
                        </p>
                        <p className="text-muted-2 text-xs">
                          Online Payment (PhonePe)
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {order.cancellationRequest?.status === "pending" && (
                          <Badge className="bg-paper-1 text-brand-3">
                            Cancellation Requested
                          </Badge>
                        )}
                        {order.cancellationRequest?.status === "rejected" && (
                          <Badge className="bg-danger-3 text-danger-4">
                            Cancellation Rejected
                          </Badge>
                        )}
                        {order.status === "pending" &&
                          order.paymentStatus !== "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-danger-1 hover:text-danger-2 rounded-full border-black/10"
                              disabled={cancelMutation.isPending}
                              onClick={() => {
                                const confirmed = window.confirm(
                                  "Cancel this order? This can't be undone."
                                );
                                if (confirmed) {
                                  cancelMutation.mutate({ orderId: order.id });
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        {order.paymentStatus === "paid" &&
                          order.status !== "cancelled" &&
                          !order.cancellationRequest && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-danger-1 hover:text-danger-2 rounded-full border-black/10"
                                >
                                  Request Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="border border-black/5 bg-white/95">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Request Cancellation
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tell us why you want to cancel (optional).
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <textarea
                                  className="focus:border-brand-1 focus:ring-brand-1 w-full rounded-2xl border border-black/10 bg-white/80 p-3 text-sm focus:ring-1 focus:outline-none"
                                  rows={3}
                                  placeholder="Reason (optional)"
                                  value={cancelRequestReasons[order.id] ?? ""}
                                  onChange={(event) =>
                                    setCancelRequestReasons((prev) => ({
                                      ...prev,
                                      [order.id]: event.target.value,
                                    }))
                                  }
                                />
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Back</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      requestCancellationMutation.mutate({
                                        orderId: order.id,
                                        reason:
                                          cancelRequestReasons[order.id] ?? "",
                                      })
                                    }
                                    className="bg-danger-1 hover:bg-danger-2 text-white"
                                  >
                                    Submit Request
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-ink-1 rounded-full border-black/10 hover:bg-white"
                        >
                          <Link href={`/order-confirmation/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mt-4 border-t border-black/5 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="bg-paper-1 text-ink-2 flex items-center gap-2 rounded-full px-3 py-1 text-xs"
                        >
                          <span className="font-medium">
                            {item.productName}
                          </span>
                          <span className="text-muted-2">
                            x{Number(item.quantity)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="bg-paper-1 text-muted-2 rounded-full px-3 py-1 text-xs">
                          +{order.items.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
