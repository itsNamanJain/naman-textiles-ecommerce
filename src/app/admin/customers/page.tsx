"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  IndianRupee,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FadeIn } from "@/components/ui/motion";
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

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const limit = 10;

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCursorStack([]);
    // Simple debounce
    setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  const currentCursor =
    cursorStack.length > 0 ? cursorStack[cursorStack.length - 1] : undefined;

  const { data, isLoading } = api.admin.getCustomers.useQuery({
    limit,
    cursor: currentCursor,
    search: debouncedSearch || undefined,
  });

  const { data: customerDetails, isLoading: isLoadingDetails } =
    api.admin.getCustomer.useQuery(
      { id: selectedCustomerId! },
      { enabled: !!selectedCustomerId }
    );

  const customers = data?.customers ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl text-[#2d1c12]">Customers</h1>
            <p className="mt-1 text-[#6b5645]">
              Manage your customer database and view order history
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Search */}
      <FadeIn delay={0.1}>
        <Card className="border border-black/5 bg-white/80">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9c826a]" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 rounded-2xl border-black/10 bg-white/80"
              />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Customers Table */}
      <FadeIn delay={0.2}>
        <Card className="border border-black/5 bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl text-[#2d1c12]">
              <Users className="h-5 w-5" />
              All Customers
              {customers.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {customers.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#b8743a]" />
              </div>
            ) : customers.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-[#cbb5a1]" />
                <h3 className="mt-4 text-lg font-medium text-[#2d1c12]">
                  No customers found
                </h3>
                <p className="mt-2 text-[#6b5645]">
                  {search
                    ? "Try adjusting your search terms"
                    : "Customers will appear here when they sign up"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="text-center">Orders</TableHead>
                        <TableHead className="text-right">
                          Total Spent
                        </TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7efe7] font-medium text-[#b8743a]">
                                {customer.name?.charAt(0).toUpperCase() ?? "U"}
                              </div>
                              <div>
                                <p className="font-medium text-[#2d1c12]">
                                  {customer.name ?? "Unknown"}
                                </p>
                                {customer.emailVerified && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3 text-[#9c826a]" />
                                <span className="text-[#6b5645]">
                                  {customer.email}
                                </span>
                              </div>
                              {customer.phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3 text-[#9c826a]" />
                                  <span className="text-[#6b5645]">
                                    {customer.phone}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <ShoppingBag className="h-4 w-4 text-[#9c826a]" />
                              <span className="font-medium text-[#2d1c12]">
                                {customer.orderCount}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <IndianRupee className="h-4 w-4 text-[#9c826a]" />
                              <span className="font-medium text-[#2d1c12]">
                                {formatPrice(customer.totalSpent).replace(
                                  "₹",
                                  ""
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-[#6b5645]">
                              <Calendar className="h-3 w-3" />
                              {new Date(customer.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#2d1c12]"
                              onClick={() => setSelectedCustomerId(customer.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {(data?.nextCursor || cursorStack.length > 0) && (
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cursorStack.length === 0}
                      onClick={() =>
                        setCursorStack((prev) => prev.slice(0, -1))
                      }
                      className="rounded-full border-black/10 bg-white/80 text-[#2d1c12] hover:bg-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!data?.nextCursor}
                      onClick={() =>
                        data?.nextCursor &&
                        setCursorStack((prev) => [...prev, data.nextCursor!])
                      }
                      className="rounded-full border-black/10 bg-white/80 text-[#2d1c12] hover:bg-white"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Customer Details Dialog */}
      <Dialog
        open={!!selectedCustomerId}
        onOpenChange={(open) => !open && setSelectedCustomerId(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : customerDetails ? (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full text-2xl font-medium">
                  {customerDetails.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {customerDetails.name ?? "Unknown"}
                  </h3>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      {customerDetails.email}
                    </div>
                    {customerDetails.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        {customerDetails.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-primary text-2xl font-bold">
                      {customerDetails.orderCount}
                    </p>
                    <p className="text-sm text-gray-500">Total Orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(customerDetails.totalSpent)}
                    </p>
                    <p className="text-sm text-gray-500">Total Spent</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {new Date(customerDetails.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                    <p className="text-sm text-gray-500">Member Since</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <div>
                <h4 className="mb-3 font-medium">Recent Orders</h4>
                {customerDetails.orders.length === 0 ? (
                  <p className="py-4 text-center text-gray-500">
                    No orders yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customerDetails.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
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
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
