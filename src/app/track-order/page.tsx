"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Home,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion";
import { formatPrice } from "@/lib/utils";
import { api } from "@/trpc/react";

const statusSteps = [
  { status: "pending", label: "Order Placed", icon: Clock },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { status: "processing", label: "Processing", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: MapPin },
];

const statusIndex: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
  refunded: -1,
};

const getStatusIndex = (status: string): number => {
  return statusIndex[status] ?? -1;
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [searchedOrderNumber, setSearchedOrderNumber] = useState<string | null>(null);

  const { data: order, isLoading, error } = api.order.getByOrderNumber.useQuery(
    { orderNumber: searchedOrderNumber! },
    { enabled: !!searchedOrderNumber }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearchedOrderNumber(orderNumber.trim().toUpperCase());
    }
  };

  const currentStatusIndex = order ? getStatusIndex(order.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center text-gray-500 hover:text-amber-600"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">Track Order</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <Package className="mx-auto h-16 w-16 text-amber-600" />
              <h1 className="mt-4 text-3xl font-bold text-gray-900">
                Track Your Order
              </h1>
              <p className="mt-2 text-gray-500">
                Enter your order number to check the delivery status
              </p>
            </div>

            {/* Search Form */}
            <Card className="mt-8">
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Enter order number (e.g., NT-20241224-XXXX)"
                      className="pl-10"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Track"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Order Status */}
            {searchedOrderNumber && (
              <FadeIn delay={0.2}>
                {isLoading ? (
                  <Card className="mt-6">
                    <CardContent className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                    </CardContent>
                  </Card>
                ) : error ? (
                  <Card className="mt-6">
                    <CardContent className="py-12 text-center">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-4 text-lg font-medium text-gray-900">
                        Order not found
                      </p>
                      <p className="mt-1 text-gray-500">
                        Please check your order number and try again
                      </p>
                    </CardContent>
                  </Card>
                ) : order ? (
                  <Card className="mt-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-amber-600">
                          #{order.orderNumber}
                        </CardTitle>
                        <Badge
                          className={
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Status Timeline */}
                      {order.status !== "cancelled" && order.status !== "refunded" && (
                        <div className="relative">
                          <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200" />
                          <div className="space-y-6">
                            {statusSteps.map((step, index) => {
                              const isCompleted = index <= currentStatusIndex;
                              const isCurrent = index === currentStatusIndex;
                              const Icon = step.icon;

                              return (
                                <div key={step.status} className="relative flex items-center gap-4">
                                  <div
                                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${
                                      isCompleted
                                        ? "bg-amber-600 text-white"
                                        : "bg-gray-200 text-gray-400"
                                    } ${isCurrent ? "ring-4 ring-amber-100" : ""}`}
                                  >
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p
                                      className={`font-medium ${
                                        isCompleted ? "text-gray-900" : "text-gray-400"
                                      }`}
                                    >
                                      {step.label}
                                    </p>
                                    {isCurrent && step.status === "shipped" && order.trackingNumber && (
                                      <p className="text-sm text-gray-500">
                                        Tracking: {order.trackingNumber}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Order Details */}
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="grid gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Order Date</span>
                            <span className="font-medium">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Delivery Location</span>
                            <span className="font-medium">
                              {order.shippingCity}, {order.shippingState}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total Amount</span>
                            <span className="font-medium text-amber-600">
                              {formatPrice(Number(order.total))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Items</span>
                            <span className="font-medium">
                              {order.items.length} item(s)
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </FadeIn>
            )}

            {/* Help Text */}
            <p className="mt-8 text-center text-sm text-gray-500">
              Can&apos;t find your order?{" "}
              <Link href="/contact" className="text-amber-600 hover:underline">
                Contact our support team
              </Link>
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
