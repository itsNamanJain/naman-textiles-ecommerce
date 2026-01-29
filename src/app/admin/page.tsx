"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Users,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { formatPrice } from "@/lib/utils";
import { api } from "@/trpc/react";

const statusColors: Record<string, string> = {
  pending: "bg-[#f7efe7] text-[#8a6642]",
  confirmed: "bg-[#e8f0ff] text-[#2c4a7a]",
  processing: "bg-[#efe7ff] text-[#4a2b7a]",
  shipped: "bg-[#e7f0ff] text-[#2b3f7a]",
  delivered: "bg-[#eaf4ea] text-[#2f6b3b]",
  cancelled: "bg-[#f7e6e6] text-[#8a2f35]",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  confirmed: <CheckCircle2 className="h-4 w-4" />,
  processing: <Package className="h-4 w-4" />,
  shipped: <Truck className="h-4 w-4" />,
  delivered: <CheckCircle2 className="h-4 w-4" />,
  cancelled: <AlertCircle className="h-4 w-4" />,
};

export default function AdminDashboard() {
  // Fetch dashboard data
  const { data: stats } = api.admin.getStats.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentOrders } = api.admin.getRecentOrders.useQuery(
    { limit: 5 },
    { refetchInterval: 30000 }
  );

  const { data: lowStockProducts } = api.admin.getLowStockProducts.useQuery(
    { limit: 5 },
    { refetchInterval: 60000 }
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FadeIn>
        <div>
          <h1 className="font-display text-2xl text-[#2d1c12]">Dashboard</h1>
          <p className="mt-1 text-[#6b5645]">
            Welcome back! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
      </FadeIn>

      {/* Stats Cards */}
      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <Card className="border border-black/5 bg-white/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6b5645]">
                    Total Revenue
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[#2d1c12]">
                    {formatPrice(stats?.totalRevenue ?? 0)}
                  </p>
                </div>
                <div className="rounded-full bg-[#eaf4ea] p-3">
                  <IndianRupee className="h-6 w-6 text-[#2f6b3b]" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {(stats?.revenueGrowth ?? 0) >= 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-600">
                      +{(stats?.revenueGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 rotate-180 text-[#b3474d]" />
                    <span className="text-[#b3474d]">
                      {(stats?.revenueGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="ml-2 text-[#9c826a]">from last month</span>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border border-black/5 bg-white/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6b5645]">
                    Total Orders
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[#2d1c12]">
                    {stats?.totalOrders ?? 0}
                  </p>
                </div>
                <div className="rounded-full bg-[#e7f0ff] p-3">
                  <ShoppingCart className="h-6 w-6 text-[#2b3f7a]" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {(stats?.ordersGrowth ?? 0) >= 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-600">
                      +{(stats?.ordersGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 rotate-180 text-[#b3474d]" />
                    <span className="text-[#b3474d]">
                      {(stats?.ordersGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="ml-2 text-[#9c826a]">from last month</span>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border border-black/5 bg-white/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6b5645]">
                    Total Products
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[#2d1c12]">
                    {stats?.totalProducts ?? 0}
                  </p>
                </div>
                <div className="rounded-full bg-[#efe7ff] p-3">
                  <Package className="h-6 w-6 text-[#4a2b7a]" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-[#b8743a]">
                  {stats?.lowStockCount ?? 0} low stock
                </span>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border border-black/5 bg-white/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#6b5645]">
                    Total Customers
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-[#2d1c12]">
                    {stats?.totalCustomers ?? 0}
                  </p>
                </div>
                <div className="rounded-full bg-[#f7efe7] p-3">
                  <Users className="h-6 w-6 text-[#b8743a]" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {(stats?.customersGrowth ?? 0) >= 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-600">
                      +{(stats?.customersGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 rotate-180 text-[#b3474d]" />
                    <span className="text-[#b3474d]">
                      {(stats?.customersGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="ml-2 text-[#9c826a]">from last month</span>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Recent Orders & Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <FadeIn delay={0.2}>
          <Card className="border border-black/5 bg-white/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg text-[#2d1c12]">
                Recent Orders
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-[#2d1c12]"
              >
                <Link href="/admin/orders">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentOrders && recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/70 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7efe7] text-[#b8743a]">
                          {statusIcons[order.status]}
                        </div>
                        <div>
                          <p className="font-medium text-[#2d1c12]">
                            #{order.orderNumber}
                          </p>
                          <p className="text-sm text-[#9c826a]">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#2d1c12]">
                          {formatPrice(Number(order.total))}
                        </p>
                        <Badge
                          className={statusColors[order.status]}
                          variant="secondary"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-[#9c826a]">
                  No orders yet
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* Low Stock Alert */}
        <FadeIn delay={0.3}>
          <Card className="border border-black/5 bg-white/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg text-[#2d1c12]">
                Low Stock Alert
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-[#2d1c12]"
              >
                <Link href="/admin/products">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {lowStockProducts && lowStockProducts.length > 0 ? (
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/70 p-3"
                    >
                      <div>
                        <p className="font-medium text-[#2d1c12]">
                          {product.name}
                        </p>
                        <p className="text-sm text-[#9c826a]">
                          SKU: {product.sku ?? "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            Number(product.stockQuantity) <= 5
                              ? "text-[#b3474d]"
                              : "text-[#b8743a]"
                          }`}
                        >
                          {product.stockQuantity} in stock
                        </p>
                        <p className="text-sm text-[#9c826a]">
                          Min: {product.lowStockThreshold}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-[#9c826a]">
                  All products are well stocked
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Order Status Overview */}
      <FadeIn delay={0.4}>
        <Card className="border border-black/5 bg-white/80">
          <CardHeader>
            <CardTitle className="font-display text-lg text-[#2d1c12]">
              Order Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { status: "pending", label: "Pending", color: "bg-[#b8743a]" },
                {
                  status: "confirmed",
                  label: "Confirmed",
                  color: "bg-[#2c4a7a]",
                },
                {
                  status: "processing",
                  label: "Processing",
                  color: "bg-[#4a2b7a]",
                },
                { status: "shipped", label: "Shipped", color: "bg-[#2b3f7a]" },
                {
                  status: "delivered",
                  label: "Delivered",
                  color: "bg-[#2f6b3b]",
                },
                {
                  status: "cancelled",
                  label: "Cancelled",
                  color: "bg-[#b3474d]",
                },
              ].map((item) => (
                <div
                  key={item.status}
                  className="rounded-2xl border border-black/5 bg-white/70 p-4 text-center"
                >
                  <div
                    className={`mx-auto mb-2 h-3 w-3 rounded-full ${item.color}`}
                  />
                  <p className="text-2xl font-semibold text-[#2d1c12]">
                    {stats?.ordersByStatus?.[item.status] ?? 0}
                  </p>
                  <p className="text-sm text-[#9c826a]">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
