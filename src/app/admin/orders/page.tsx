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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [trackingNumbers, setTrackingNumbers] = useState<Record<string, string>>(
    {}
  );

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
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="mt-1 text-gray-500">
              Manage and track all orders
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.1}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search orders by number, customer..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No orders found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-gray-500">
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
                    <StaggerContainer>
                      {filteredOrders.map((order) => {
                        const currentTracking =
                          trackingNumbers[order.id] ??
                          order.trackingNumber ??
                          "";
                        const canSaveTracking =
                          currentTracking.trim().length > 0 &&
                          currentTracking !== (order.trackingNumber ?? "");

                        return (
                          <StaggerItem
                            key={order.id}
                            className="border-b last:border-0"
                          >
                            <tr>
                            <td className="py-4">
                              <p className="font-medium text-amber-600">
                                #{order.orderNumber}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.items.length} item(s)
                              </p>
                            </td>
                            <td className="py-4">
                              <p className="font-medium">
                                {order.user?.name ?? "Guest"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.user?.email}
                              </p>
                            </td>
                            <td className="py-4 text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-4 font-medium">
                              {formatPrice(Number(order.total))}
                            </td>
                            <td className="py-4">
                              <Badge
                                variant="secondary"
                                className={
                                  order.paymentStatus === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
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
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                    Delivered
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(order.id, "cancelled")
                                    }
                                    className="text-red-600"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelled
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                            <td className="py-4">
                              <div className="flex min-w-[220px] items-center gap-2">
                                <Input
                                  placeholder="Tracking #"
                                  value={currentTracking}
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
                                  onClick={() =>
                                    handleTrackingSave(order.id, order.status)
                                  }
                                >
                                  Save
                                </Button>
                              </div>
                            </td>
                            <td className="py-4">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/order-confirmation/${order.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                            </td>
                            </tr>
                          </StaggerItem>
                        );
                      })}
                    </StaggerContainer>
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
