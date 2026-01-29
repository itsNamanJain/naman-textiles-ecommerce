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
  const [searchedOrderNumber, setSearchedOrderNumber] = useState<string | null>(
    null
  );

  const {
    data: order,
    isLoading,
    error,
  } = api.order.getByOrderNumber.useQuery(
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
    <div className="min-h-screen bg-transparent">
      {/* Breadcrumb */}
      <div className="border-b border-black/5 bg-white/70">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-muted-2 hover:text-brand-1 flex items-center"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="text-muted-3 h-4 w-4" />
            <span className="text-ink-1 font-medium">Track Order</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <Package className="text-brand-1 mx-auto h-16 w-16" />
              <h1 className="font-display text-ink-1 mt-4 text-3xl">
                Track Your Order
              </h1>
              <p className="text-muted-1 mt-2">
                Enter your order number to check the delivery status
              </p>
            </div>

            {/* Search Form */}
            <Card className="mt-8 border border-black/5 bg-white/80">
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="text-muted-2 absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                    <Input
                      placeholder="Enter order number (e.g., NT-20241224-XXXX)"
                      className="rounded-2xl border-black/10 bg-white/80 pl-10"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-brand-1 hover:bg-brand-2 rounded-full"
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
                  <Card className="mt-6 border border-black/5 bg-white/80">
                    <CardContent className="flex items-center justify-center py-12">
                      <Loader2 className="text-brand-1 h-8 w-8 animate-spin" />
                    </CardContent>
                  </Card>
                ) : error ? (
                  <Card className="mt-6 border border-black/5 bg-white/80">
                    <CardContent className="py-12 text-center">
                      <Package className="text-muted-3 mx-auto h-12 w-12" />
                      <p className="text-ink-1 mt-4 text-lg font-medium">
                        Order not found
                      </p>
                      <p className="text-muted-1 mt-1">
                        Please check your order number and try again
                      </p>
                    </CardContent>
                  </Card>
                ) : order ? (
                  <Card className="mt-6 border border-black/5 bg-white/80">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-display text-brand-1 text-lg">
                          #{order.orderNumber}
                        </CardTitle>
                        <Badge
                          className={
                            order.status === "delivered"
                              ? "bg-success-2 text-success-1"
                              : order.status === "cancelled"
                                ? "bg-danger-3 text-danger-4"
                                : "bg-paper-1 text-brand-3"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Status Timeline */}
                      {order.status !== "cancelled" &&
                        order.status !== "refunded" && (
                          <div className="relative">
                            <div className="absolute top-0 left-5 h-full w-0.5 bg-black/10" />
                            <div className="space-y-6">
                              {statusSteps.map((step, index) => {
                                const isCompleted = index <= currentStatusIndex;
                                const isCurrent = index === currentStatusIndex;
                                const Icon = step.icon;

                                return (
                                  <div
                                    key={step.status}
                                    className="relative flex items-center gap-4"
                                  >
                                    <div
                                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${
                                        isCompleted
                                          ? "bg-brand-1 text-white"
                                          : "bg-gray-1 text-muted-3"
                                      } ${isCurrent ? "ring-paper-1 ring-4" : ""}`}
                                    >
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p
                                        className={`font-medium ${
                                          isCompleted
                                            ? "text-ink-1"
                                            : "text-muted-2"
                                        }`}
                                      >
                                        {step.label}
                                      </p>
                                      {isCurrent &&
                                        step.status === "shipped" &&
                                        order.trackingNumber && (
                                          <p className="text-muted-1 text-sm">
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
                      <div className="rounded-2xl border border-black/5 bg-white/80 p-4">
                        <div className="grid gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-1">Order Date</span>
                            <span className="text-ink-1 font-medium">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-1">
                              Delivery Location
                            </span>
                            <span className="text-ink-1 font-medium">
                              {order.city}, {order.state}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-1">Total Amount</span>
                            <span className="text-brand-1 font-medium">
                              {formatPrice(Number(order.total))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-1">Items</span>
                            <span className="text-ink-1 font-medium">
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
            <p className="text-muted-2 mt-8 text-center text-sm">
              Can&apos;t find your order?{" "}
              <Link href="/contact" className="text-brand-3 hover:underline">
                Contact our support team
              </Link>
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
