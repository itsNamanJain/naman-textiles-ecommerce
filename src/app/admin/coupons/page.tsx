"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  Plus,
  Search,
  Tag,
  Percent,
  IndianRupee,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  Power,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

type CouponFormData = {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const initialFormData: CouponFormData = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  minPurchase: null,
  maxDiscount: null,
  usageLimit: null,
  startDate: dayjs().format("YYYY-MM-DD"),
  endDate: dayjs().add(30, "day").format("YYYY-MM-DD"),
  isActive: true,
};

export default function CouponsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "expired"
  >("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<string | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<{
    id: string;
    code: string;
  } | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(initialFormData);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const utils = api.useUtils();

  const { data: coupons, isLoading } = api.coupon.getAll.useQuery({
    status: statusFilter,
  });

  const createMutation = api.coupon.create.useMutation({
    onSuccess: () => {
      toast.success("Coupon created successfully");
      setIsDialogOpen(false);
      setFormData(initialFormData);
      utils.coupon.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create coupon");
    },
  });

  const updateMutation = api.coupon.update.useMutation({
    onSuccess: () => {
      toast.success("Coupon updated successfully");
      setIsDialogOpen(false);
      setEditingCoupon(null);
      setFormData(initialFormData);
      utils.coupon.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update coupon");
    },
  });

  const deleteMutation = api.coupon.delete.useMutation({
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingCoupon(null);
      utils.coupon.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete coupon");
    },
  });

  const toggleActiveMutation = api.coupon.toggleActive.useMutation({
    onSuccess: (data) => {
      toast.success(`Coupon ${data?.isActive ? "activated" : "deactivated"}`);
      utils.coupon.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to toggle coupon status");
    },
  });

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = async (couponId: string) => {
    const coupon = coupons?.find((c) => c.id === couponId);
    if (coupon) {
      setEditingCoupon(couponId);
      setFormData({
        code: coupon.code,
        description: coupon.description ?? "",
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
        usageLimit: coupon.usageLimit,
        startDate: dayjs(coupon.startDate).format("YYYY-MM-DD"),
        endDate: dayjs(coupon.endDate).format("YYYY-MM-DD"),
        isActive: coupon.isActive,
      });
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = () => {
    const data = {
      code: formData.code,
      description: formData.description || undefined,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      minPurchase: formData.minPurchase ?? undefined,
      maxDiscount: formData.maxDiscount ?? undefined,
      usageLimit: formData.usageLimit ?? undefined,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      isActive: formData.isActive,
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCoupons = coupons?.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCouponStatus = (coupon: NonNullable<typeof coupons>[0]) => {
    if (coupon.isExpired) return "expired";
    if (!coupon.isActive) return "inactive";
    if (coupon.isUsageLimitReached) return "limit_reached";
    return "active";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success-2 text-success-1">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-1 text-gray-2">Inactive</Badge>;
      case "expired":
        return <Badge className="bg-danger-2 text-danger-4">Expired</Badge>;
      case "limit_reached":
        return <Badge className="bg-paper-1 text-brand-3">Limit Reached</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-ink-1 text-2xl">Coupons</h1>
          <p className="text-muted-1">Create and manage discount coupons</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-ink-1 text-paper-1 hover:bg-ink-0 rounded-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-2 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-2xl border-black/10 bg-white/80 pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <SelectTrigger className="w-full rounded-full border-black/10 bg-white/80 sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-black/5 bg-white/80">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-2">Code</TableHead>
              <TableHead className="text-muted-2">Discount</TableHead>
              <TableHead className="text-muted-2 hidden md:table-cell">
                Usage
              </TableHead>
              <TableHead className="text-muted-2 hidden lg:table-cell">
                Valid Period
              </TableHead>
              <TableHead className="text-muted-2">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCoupons?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <Tag className="text-muted-3 mx-auto h-12 w-12" />
                  <p className="text-muted-2 mt-2">No coupons found</p>
                  <Button
                    variant="outline"
                    className="hover:bg-paper-1 mt-4 rounded-full border-black/10 bg-white/80"
                    onClick={handleOpenCreate}
                  >
                    Create your first coupon
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredCoupons?.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-paper-2 text-ink-1 rounded-full px-3 py-1 font-mono text-sm font-semibold">
                        {coupon.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="text-muted-3 hover:text-ink-1"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="text-success-1 h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {coupon.description && (
                      <p className="text-muted-2 mt-1 line-clamp-1 text-xs">
                        {coupon.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {coupon.discountType === "percentage" ? (
                        <>
                          <Percent className="text-brand-3 h-4 w-4" />
                          <span className="font-medium">
                            {coupon.discountValue}%
                          </span>
                        </>
                      ) : (
                        <>
                          <IndianRupee className="text-brand-3 h-4 w-4" />
                          <span className="font-medium">
                            {coupon.discountValue}
                          </span>
                        </>
                      )}
                    </div>
                    {coupon.minPurchase && (
                      <p className="text-muted-2 text-xs">
                        Min: {formatPrice(coupon.minPurchase)}
                      </p>
                    )}
                    {coupon.maxDiscount &&
                      coupon.discountType === "percentage" && (
                        <p className="text-muted-2 text-xs">
                          Max: {formatPrice(coupon.maxDiscount)}
                        </p>
                      )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="font-medium">{coupon.usageCount}</span>
                    {coupon.usageLimit && (
                      <span className="text-muted-2">
                        {" "}
                        / {coupon.usageLimit}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="text-muted-3 h-3.5 w-3.5" />
                      <span>
                        {dayjs(coupon.startDate).format("DD MMM")} -{" "}
                        {dayjs(coupon.endDate).format("DD MMM YYYY")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(getCouponStatus(coupon))}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleOpenEdit(coupon.id)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toggleActiveMutation.mutate({ id: coupon.id })
                          }
                        >
                          <Power className="mr-2 h-4 w-4" />
                          {coupon.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-danger-4"
                          onClick={() => {
                            setDeletingCoupon({
                              id: coupon.id,
                              code: coupon.code,
                            });
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md border border-black/5 bg-white/90">
          <DialogHeader>
            <DialogTitle className="font-display text-ink-1">
              {editingCoupon ? "Edit Coupon" : "Create Coupon"}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon
                ? "Update the coupon details below"
                : "Fill in the details to create a new coupon"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Coupon Code *</Label>
              <Input
                id="code"
                placeholder="e.g., SAVE20"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="mt-1 font-mono uppercase"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Get 20% off on all fabrics"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      discountType: v as "percentage" | "fixed",
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discountValue">Value *</Label>
                <Input
                  id="discountValue"
                  type="number"
                  min={0}
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPurchase">Min Purchase (₹)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  min={0}
                  placeholder="No minimum"
                  value={formData.minPurchase ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minPurchase: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxDiscount">Max Discount (₹)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  min={0}
                  placeholder="No limit"
                  value={formData.maxDiscount ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDiscount: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  className="mt-1"
                  disabled={formData.discountType === "fixed"}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                min={1}
                placeholder="Unlimited"
                value={formData.usageLimit ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usageLimit: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-full border-black/10 bg-white/80"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-ink-1 text-paper-1 hover:bg-ink-0 rounded-full"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingCoupon ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="border border-black/5 bg-white/95">
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the coupon{" "}
              <code className="bg-paper-2 text-ink-1 rounded px-1 font-mono">
                {deletingCoupon?.code}
              </code>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-full border-black/10 bg-white/80"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deletingCoupon &&
                deleteMutation.mutate({ id: deletingCoupon.id })
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
