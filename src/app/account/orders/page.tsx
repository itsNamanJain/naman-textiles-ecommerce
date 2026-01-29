"use client";

import Link from "next/link";
import { Package, ChevronRight, ShoppingBag, Loader2, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { formatPrice } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function OrdersPage() {
  const utils = api.useUtils();

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
        <p className="mt-4 text-gray-500">Loading orders...</p>
      </div>
    );
  }

  const orders = data?.orders ?? [];

  if (orders.length === 0) {
    return (
      <FadeIn>
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-gray-100 p-6">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                No orders yet
              </h2>
              <p className="mt-2 text-gray-500">
                When you place your first order, it will appear here.
              </p>
              <Button
                className="mt-6 bg-amber-600 hover:bg-amber-700"
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            My Orders ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StaggerContainer className="space-y-4">
            {orders.map((order) => (
              <StaggerItem key={order.id}>
                <div className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Order Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-amber-600">
                          #{order.orderNumber}
                        </p>
                        <Badge className={statusColors[order.status]}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length > 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Order Total & Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatPrice(Number(order.total))}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : "Paid Online"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
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
                        <Button variant="outline" size="sm" asChild>
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
                  <div className="mt-4 border-t pt-4">
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs"
                        >
                          <span className="font-medium">{item.productName}</span>
                          <span className="text-gray-500">
                            x{Number(item.quantity)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
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
