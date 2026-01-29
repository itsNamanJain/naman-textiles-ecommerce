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
  pending: "bg-[#f7efe7] text-[#8a6642]",
  confirmed: "bg-[#e8f0ff] text-[#2c4a7a]",
  processing: "bg-[#efe7ff] text-[#4a2b7a]",
  shipped: "bg-[#e7f0ff] text-[#2b3f7a]",
  delivered: "bg-[#eaf4ea] text-[#2f6b3b]",
  cancelled: "bg-[#f7e6e6] text-[#8a2f35]",
  refunded: "bg-[#f0f0f0] text-[#5c5c5c]",
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
        <Loader2 className="h-12 w-12 animate-spin text-[#b8743a]" />
        <p className="mt-4 text-[#6b5645]">Loading orders...</p>
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
              <div className="rounded-full bg-[#f7efe7] p-6">
                <Package className="h-12 w-12 text-[#b0896d]" />
              </div>
              <h2 className="font-display mt-4 text-xl text-[#2d1c12]">
                No orders yet
              </h2>
              <p className="mt-2 text-[#6b5645]">
                When you place your first order, it will appear here.
              </p>
              <Button
                className="mt-6 rounded-full bg-[#b8743a] hover:bg-[#a4632f]"
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
          <CardTitle className="font-display flex items-center gap-2 text-xl text-[#2d1c12]">
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
                        <p className="font-semibold text-[#b8743a]">
                          #{order.orderNumber}
                        </p>
                        <Badge className={statusColors[order.status]}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#6b5645]">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-[#6b5645]">
                        {order.items.length} item
                        {order.items.length > 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Order Total & Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-[#2d1c12]">
                          {formatPrice(Number(order.total))}
                        </p>
                        <p className="text-xs text-[#9c826a]">
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
                            className="rounded-full border-black/10 text-[#b3474d] hover:text-[#9a3a40]"
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
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="rounded-full border-black/10 text-[#2d1c12] hover:bg-white"
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
                          className="flex items-center gap-2 rounded-full bg-[#f7efe7] px-3 py-1 text-xs text-[#5c4a3d]"
                        >
                          <span className="font-medium">
                            {item.productName}
                          </span>
                          <span className="text-[#9c826a]">
                            x{Number(item.quantity)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="rounded-full bg-[#f7efe7] px-3 py-1 text-xs text-[#9c826a]">
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
