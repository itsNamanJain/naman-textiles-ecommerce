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
  pending: "bg-paper-1 text-brand-3",
  confirmed: "bg-info-2 text-info-1",
  processing: "bg-purple-2 text-purple-1",
  shipped: "bg-indigo-2 text-indigo-1",
  delivered: "bg-success-2 text-success-1",
  cancelled: "bg-danger-3 text-danger-4",
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FadeIn>
        <div>
          <h1 className="font-display text-ink-1 text-2xl">Dashboard</h1>
          <p className="text-muted-1 mt-1">
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
                  <p className="text-muted-1 text-sm font-medium">
                    Total Revenue
                  </p>
                  <p className="text-ink-1 mt-1 text-2xl font-semibold">
                    {formatPrice(stats?.totalRevenue ?? 0)}
                  </p>
                </div>
                <div className="bg-success-2 rounded-full p-3">
                  <IndianRupee className="text-success-1 h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {(stats?.revenueGrowth ?? 0) >= 0 ? (
                  <>
                    <TrendingUp className="text-success-1 mr-1 h-4 w-4" />
                    <span className="text-success-1">
                      +{(stats?.revenueGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="text-danger-1 mr-1 h-4 w-4 rotate-180" />
                    <span className="text-danger-1">
                      {(stats?.revenueGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-muted-2 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border border-black/5 bg-white/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-1 text-sm font-medium">
                    Total Orders
                  </p>
                  <p className="text-ink-1 mt-1 text-2xl font-semibold">
                    {stats?.totalOrders ?? 0}
                  </p>
                </div>
                <div className="bg-indigo-2 rounded-full p-3">
                  <ShoppingCart className="text-indigo-1 h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {(stats?.ordersGrowth ?? 0) >= 0 ? (
                  <>
                    <TrendingUp className="text-success-1 mr-1 h-4 w-4" />
                    <span className="text-success-1">
                      +{(stats?.ordersGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="text-danger-1 mr-1 h-4 w-4 rotate-180" />
                    <span className="text-danger-1">
                      {(stats?.ordersGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-muted-2 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border border-black/5 bg-white/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-1 text-sm font-medium">
                    Total Products
                  </p>
                  <p className="text-ink-1 mt-1 text-2xl font-semibold">
                    {stats?.totalProducts ?? 0}
                  </p>
                </div>
                <div className="bg-purple-2 rounded-full p-3">
                  <Package className="text-purple-1 h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-brand-1">
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
                  <p className="text-muted-1 text-sm font-medium">
                    Total Customers
                  </p>
                  <p className="text-ink-1 mt-1 text-2xl font-semibold">
                    {stats?.totalCustomers ?? 0}
                  </p>
                </div>
                <div className="bg-paper-1 rounded-full p-3">
                  <Users className="text-brand-1 h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {(stats?.customersGrowth ?? 0) >= 0 ? (
                  <>
                    <TrendingUp className="text-success-1 mr-1 h-4 w-4" />
                    <span className="text-success-1">
                      +{(stats?.customersGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="text-danger-1 mr-1 h-4 w-4 rotate-180" />
                    <span className="text-danger-1">
                      {(stats?.customersGrowth ?? 0).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-muted-2 ml-2">from last month</span>
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
              <CardTitle className="font-display text-ink-1 text-lg">
                Recent Orders
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-ink-1">
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
                        <div className="bg-paper-1 text-brand-1 flex h-10 w-10 items-center justify-center rounded-full">
                          {statusIcons[order.status]}
                        </div>
                        <div>
                          <p className="text-ink-1 font-medium">
                            #{order.orderNumber}
                          </p>
                          <p className="text-muted-2 text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-ink-1 font-medium">
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
                <div className="text-muted-2 py-8 text-center">
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
              <CardTitle className="font-display text-ink-1 text-lg">
                Low Stock Alert
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-ink-1">
                <Link href="/admin/products">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-muted-2 py-8 text-center">
                Inventory tracking is disabled
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Order Status Overview */}
      <FadeIn delay={0.4}>
        <Card className="border border-black/5 bg-white/80">
          <CardHeader>
            <CardTitle className="font-display text-ink-1 text-lg">
              Order Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { status: "pending", label: "Pending", color: "bg-brand-1" },
                {
                  status: "confirmed",
                  label: "Confirmed",
                  color: "bg-info-1",
                },
                {
                  status: "processing",
                  label: "Processing",
                  color: "bg-purple-1",
                },
                { status: "shipped", label: "Shipped", color: "bg-indigo-1" },
                {
                  status: "delivered",
                  label: "Delivered",
                  color: "bg-success-1",
                },
                {
                  status: "cancelled",
                  label: "Cancelled",
                  color: "bg-danger-1",
                },
              ].map((item) => (
                <div
                  key={item.status}
                  className="rounded-2xl border border-black/5 bg-white/70 p-4 text-center"
                >
                  <div
                    className={`mx-auto mb-2 h-3 w-3 rounded-full ${item.color}`}
                  />
                  <p className="text-ink-1 text-2xl font-semibold">
                    {stats?.ordersByStatus?.[item.status] ?? 0}
                  </p>
                  <p className="text-muted-2 text-sm">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
