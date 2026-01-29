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
  pending: "bg-paper-1 text-brand-3",
  confirmed: "bg-info-2 text-info-1",
  processing: "bg-purple-2 text-purple-1",
  shipped: "bg-indigo-2 text-indigo-1",
  delivered: "bg-success-2 text-success-1",
  cancelled: "bg-danger-3 text-danger-4",
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
            <h1 className="font-display text-ink-1 text-2xl">Customers</h1>
            <p className="text-muted-1 mt-1">
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
              <Search className="text-muted-2 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="rounded-2xl border-black/10 bg-white/80 pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Customers Table */}
      <FadeIn delay={0.2}>
        <Card className="border border-black/5 bg-white/80">
          <CardHeader>
            <CardTitle className="font-display text-ink-1 flex items-center gap-2 text-xl">
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
                <Loader2 className="text-brand-1 h-8 w-8 animate-spin" />
              </div>
            ) : customers.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="text-warm-1 mx-auto h-12 w-12" />
                <h3 className="text-ink-1 mt-4 text-lg font-medium">
                  No customers found
                </h3>
                <p className="text-muted-1 mt-2">
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
                              <div className="bg-paper-1 text-brand-1 flex h-10 w-10 items-center justify-center rounded-full font-medium">
                                {customer.name?.charAt(0).toUpperCase() ?? "U"}
                              </div>
                              <div>
                                <p className="text-ink-1 font-medium">
                                  {customer.name ?? "Unknown"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="text-muted-2 h-3 w-3" />
                                <span className="text-muted-1">
                                  {customer.email}
                                </span>
                              </div>
                              {customer.phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="text-muted-2 h-3 w-3" />
                                  <span className="text-muted-1">
                                    {customer.phone}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <ShoppingBag className="text-muted-2 h-4 w-4" />
                              <span className="text-ink-1 font-medium">
                                {customer.orderCount}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <IndianRupee className="text-muted-2 h-4 w-4" />
                              <span className="text-ink-1 font-medium">
                                {formatPrice(customer.totalSpent).replace(
                                  "₹",
                                  ""
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-muted-1 flex items-center gap-1 text-sm">
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
                              className="text-ink-1"
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
                      className="text-ink-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
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
                      className="text-ink-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
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
        <DialogContent className="max-w-2xl border border-black/5 bg-white/95">
          <DialogHeader>
            <DialogTitle className="font-display text-ink-1">
              Customer Details
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-brand-1 h-8 w-8 animate-spin" />
            </div>
          ) : customerDetails ? (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-start gap-4">
                <div className="bg-paper-1 text-brand-3 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-medium">
                  {customerDetails.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <div className="flex-1">
                  <h3 className="text-ink-1 text-xl font-semibold">
                    {customerDetails.name ?? "Unknown"}
                  </h3>
                  <div className="mt-1 space-y-1">
                    <div className="text-muted-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {customerDetails.email}
                    </div>
                    {customerDetails.phone && (
                      <div className="text-muted-2 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {customerDetails.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border border-black/5 bg-white/80">
                  <CardContent className="p-4 text-center">
                    <p className="text-brand-3 text-2xl font-bold">
                      {customerDetails.orderCount}
                    </p>
                    <p className="text-muted-2 text-sm">Total Orders</p>
                  </CardContent>
                </Card>
                <Card className="border border-black/5 bg-white/80">
                  <CardContent className="p-4 text-center">
                    <p className="text-success-1 text-2xl font-bold">
                      {formatPrice(customerDetails.totalSpent)}
                    </p>
                    <p className="text-muted-2 text-sm">Total Spent</p>
                  </CardContent>
                </Card>
                <Card className="border border-black/5 bg-white/80">
                  <CardContent className="p-4 text-center">
                    <p className="text-ink-1 text-2xl font-bold">
                      {new Date(customerDetails.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                    <p className="text-muted-2 text-sm">Member Since</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <div>
                <h4 className="mb-3 font-medium">Recent Orders</h4>
                {customerDetails.orders.length === 0 ? (
                  <p className="text-muted-2 py-4 text-center">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {customerDetails.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/90 p-3"
                      >
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-muted-2 text-sm">
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
