"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Filter,
  Eye,
  Loader2,
  ChevronDown,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FadeIn } from "@/components/ui/motion";
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

const statusOptions = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [trackingNumbers, setTrackingNumbers] = useState<
    Record<string, string>
  >({});

  const utils = api.useUtils();

  const { data, isLoading, refetch } = api.admin.getOrders.useQuery({
    limit: 50,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const updateStatusMutation = api.admin.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      utils.admin.getOrders.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });
  const updateCancellationMutation =
    api.admin.updateCancellationRequest.useMutation({
      onSuccess: () => {
        toast.success("Cancellation request updated");
        utils.admin.getOrders.invalidate();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update request");
      },
    });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleTrackingSave = (orderId: string, status: OrderStatus) => {
    const trackingNumber = trackingNumbers[orderId]?.trim();
    if (!trackingNumber) {
      toast.error("Enter a tracking number");
      return;
    }

    updateStatusMutation.mutate(
      { orderId, status, trackingNumber },
      {
        onSuccess: () => {
          setTrackingNumbers((prev) => {
            const next = { ...prev };
            delete next[orderId];
            return next;
          });
        },
      }
    );
  };

  const orders = data?.orders ?? [];

  // Client-side search filter
  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-ink-1 text-2xl">Orders</h1>
            <p className="text-muted-1 mt-1">Manage and track all orders</p>
          </div>
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
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.1}>
        <Card className="border border-black/5 bg-white/80">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-2 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search orders by number, customer..."
                  className="rounded-2xl border-black/10 bg-white/80 pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as OrderStatus | "all")
                }
              >
                <SelectTrigger className="w-full rounded-full border-black/10 bg-white/80 sm:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Orders List */}
      <FadeIn delay={0.2}>
        <Card className="border border-black/5 bg-white/80">
          <CardHeader>
            <CardTitle className="font-display text-ink-1 flex items-center gap-2 text-xl">
              <Package className="h-5 w-5" />
              Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-brand-1 h-8 w-8 animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-muted-2 py-12 text-center">
                No orders found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-muted-2 border-b border-black/5 text-left text-sm">
                      <th className="pb-3 font-medium">Order</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Total</th>
                      <th className="pb-3 font-medium">Payment</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Tracking</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const currentTracking =
                        trackingNumbers[order.id] ?? order.trackingNumber ?? "";
                      const canSaveTracking =
                        currentTracking.trim().length > 0 &&
                        currentTracking !== (order.trackingNumber ?? "");

                      return (
                        <tr
                          key={order.id}
                          className="border-b border-black/5 last:border-0"
                        >
                          <td className="py-4">
                            <p className="text-brand-1 font-medium">
                              #{order.orderNumber}
                            </p>
                            <p className="text-muted-2 text-sm">
                              {order.items.length} item(s)
                            </p>
                          </td>
                          <td className="py-4">
                            <p className="text-ink-1 font-medium">
                              {order.user?.name ?? "Guest"}
                            </p>
                            <p className="text-muted-2 text-sm">
                              {order.user?.email}
                            </p>
                          </td>
                          <td className="text-muted-1 py-4 text-sm">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="text-ink-1 py-4 font-medium">
                            {formatPrice(Number(order.total))}
                          </td>
                          <td className="py-4">
                            <Badge
                              variant="secondary"
                              className={
                                order.paymentStatus === "paid"
                                  ? "bg-success-2 text-success-1"
                                  : "bg-paper-1 text-brand-3"
                              }
                            >
                              {order.paymentStatus}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`${statusColors[order.status]} hover:opacity-80`}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  {order.status}
                                  <ChevronDown className="ml-1 h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(order.id, "pending")
                                  }
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(order.id, "confirmed")
                                  }
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Confirmed
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(order.id, "processing")
                                  }
                                >
                                  <Package className="mr-2 h-4 w-4" />
                                  Processing
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(order.id, "shipped")
                                  }
                                >
                                  <Truck className="mr-2 h-4 w-4" />
                                  Shipped
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(order.id, "delivered")
                                  }
                                >
                                  <CheckCircle2 className="text-success-1 mr-2 h-4 w-4" />
                                  Delivered
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(order.id, "cancelled")
                                  }
                                  className="text-danger-1"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancelled
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            {order.cancellationRequest?.status ===
                              "pending" && (
                              <div className="mt-2">
                                <Badge className="bg-paper-1 text-brand-3">
                                  Cancellation Requested
                                </Badge>
                                {order.cancellationRequest.reason && (
                                  <p className="text-muted-2 mt-1 text-xs">
                                    Reason: {order.cancellationRequest.reason}
                                  </p>
                                )}
                              </div>
                            )}
                            {order.cancellationRequest?.status ===
                              "rejected" && (
                              <div className="mt-2">
                                <Badge className="bg-danger-3 text-danger-4">
                                  Cancellation Rejected
                                </Badge>
                                {order.cancellationRequest.reason && (
                                  <p className="text-muted-2 mt-1 text-xs">
                                    Reason: {order.cancellationRequest.reason}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-4">
                            <div className="flex min-w-[220px] items-center gap-2">
                              <Input
                                placeholder="Tracking #"
                                value={currentTracking}
                                className="rounded-2xl border-black/10 bg-white/80"
                                onChange={(event) =>
                                  setTrackingNumbers((prev) => ({
                                    ...prev,
                                    [order.id]: event.target.value,
                                  }))
                                }
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                  updateStatusMutation.isPending ||
                                  !canSaveTracking
                                }
                                className="text-ink-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
                                onClick={() =>
                                  handleTrackingSave(order.id, order.status)
                                }
                              >
                                Save
                              </Button>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {order.cancellationRequest?.status ===
                                "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-success-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
                                    disabled={
                                      updateCancellationMutation.isPending
                                    }
                                    onClick={() =>
                                      updateCancellationMutation.mutate({
                                        orderId: order.id,
                                        status: "approved",
                                      })
                                    }
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-danger-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
                                    disabled={
                                      updateCancellationMutation.isPending
                                    }
                                    onClick={() =>
                                      updateCancellationMutation.mutate({
                                        orderId: order.id,
                                        status: "rejected",
                                      })
                                    }
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="text-ink-1"
                              >
                                <Link href={`/order-confirmation/${order.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
