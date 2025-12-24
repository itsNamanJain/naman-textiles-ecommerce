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
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Welcome back! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
      </FadeIn>

      {/* Stats Cards */}
      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Revenue
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {formatPrice(stats?.totalRevenue ?? 0)}
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <IndianRupee className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {(stats?.revenueGrowth ?? 0) >= 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                    <span className="text-green-600">
                      +{(stats?.revenueGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 rotate-180 text-red-500" />
                    <span className="text-red-600">
                      {(stats?.revenueGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="ml-2 text-gray-500">from last month</span>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Orders
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {stats?.totalOrders ?? 0}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {(stats?.ordersGrowth ?? 0) >= 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                    <span className="text-green-600">
                      +{(stats?.ordersGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 rotate-180 text-red-500" />
                    <span className="text-red-600">
                      {(stats?.ordersGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="ml-2 text-gray-500">from last month</span>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Products
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {stats?.totalProducts ?? 0}
                  </p>
                </div>
                <div className="rounded-full bg-purple-100 p-3">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-amber-600">
                  {stats?.lowStockCount ?? 0} low stock
                </span>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Customers
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {stats?.totalCustomers ?? 0}
                  </p>
                </div>
                <div className="rounded-full bg-amber-100 p-3">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {(stats?.customersGrowth ?? 0) >= 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                    <span className="text-green-600">
                      +{(stats?.customersGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 rotate-180 text-red-500" />
                    <span className="text-red-600">
                      {(stats?.customersGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="ml-2 text-gray-500">from last month</span>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Recent Orders & Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild>
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
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          {statusIcons[order.status]}
                        </div>
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
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
                <div className="py-8 text-center text-gray-500">
                  No orders yet
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* Low Stock Alert */}
        <FadeIn delay={0.3}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Low Stock Alert</CardTitle>
              <Button variant="ghost" size="sm" asChild>
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
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          SKU: {product.sku ?? "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            Number(product.stockQuantity) <= 5
                              ? "text-red-600"
                              : "text-amber-600"
                          }`}
                        >
                          {product.stockQuantity} in stock
                        </p>
                        <p className="text-sm text-gray-500">
                          Min: {product.lowStockThreshold}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  All products are well stocked
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Order Status Overview */}
      <FadeIn delay={0.4}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { status: "pending", label: "Pending", color: "bg-yellow-500" },
                {
                  status: "confirmed",
                  label: "Confirmed",
                  color: "bg-blue-500",
                },
                {
                  status: "processing",
                  label: "Processing",
                  color: "bg-purple-500",
                },
                { status: "shipped", label: "Shipped", color: "bg-indigo-500" },
                {
                  status: "delivered",
                  label: "Delivered",
                  color: "bg-green-500",
                },
                {
                  status: "cancelled",
                  label: "Cancelled",
                  color: "bg-red-500",
                },
              ].map((item) => (
                <div
                  key={item.status}
                  className="rounded-lg border p-4 text-center"
                >
                  <div
                    className={`mx-auto mb-2 h-3 w-3 rounded-full ${item.color}`}
                  />
                  <p className="text-2xl font-bold">
                    {stats?.ordersByStatus?.[item.status] ?? 0}
                  </p>
                  <p className="text-sm text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
