"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Truck,
  Home,
  ChevronRight,
  Copy,
  Check,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { formatPrice, formatUnit } from "@/lib/utils";
import { api } from "@/trpc/react";

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [copied, setCopied] = useState(false);

  const {
    data: order,
    isLoading,
    error,
  } = api.order.getById.useQuery({ id: orderId }, { enabled: !!orderId });

  const copyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-transparent">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="text-brand-1 h-12 w-12 animate-spin" />
            <p className="text-muted-1 mt-4">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-transparent">
        <div className="container mx-auto px-4 py-12">
          <FadeIn className="flex flex-col items-center justify-center py-16">
            <Package className="text-muted-3 h-16 w-16" />
            <h1 className="font-display text-ink-1 mt-6 text-2xl">
              Order not found
            </h1>
            <p className="text-muted-1 mt-2">
              We couldn&apos;t find the order you&apos;re looking for
            </p>
            <Button
              className="bg-brand-1 hover:bg-brand-2 mt-8 rounded-full"
              size="lg"
              asChild
            >
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </FadeIn>
        </div>
      </div>
    );
  }

  // Build shipping address object from individual fields
  const shippingAddress = {
    name: order.shippingName,
    phone: order.shippingPhone,
    addressLine1: order.shippingAddressLine1,
    addressLine2: order.shippingAddressLine2,
    city: order.shippingCity,
    state: order.shippingState,
    pincode: order.shippingPincode,
  };

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
            <span className="text-ink-1 font-medium">Order Confirmation</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <FadeIn className="mb-8 text-center">
          <div className="bg-success-2 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
            <CheckCircle2 className="text-success-1 h-12 w-12" />
          </div>
          <h1 className="font-display text-ink-1 text-3xl">
            Thank you for your order!
          </h1>
          <p className="text-muted-1 mt-2">
            Your order has been placed successfully
          </p>
        </FadeIn>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Order Number Card */}
            <FadeIn delay={0.1}>
              <Card className="border border-black/5 bg-white/80">
                <CardContent className="flex items-center justify-between py-6">
                  <div>
                    <p className="text-muted-1 text-sm">Order Number</p>
                    <p className="text-brand-1 text-2xl font-semibold">
                      {order.orderNumber}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyOrderNumber}
                    className="text-ink-1 gap-2 rounded-full border-black/10 bg-white/80 hover:bg-white"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Order Status */}
            <FadeIn delay={0.2}>
              <Card className="border border-black/5 bg-white/80">
                <CardHeader>
                  <CardTitle className="font-display text-ink-1 flex items-center gap-2 text-xl">
                    <Truck className="h-5 w-5" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="bg-paper-1 flex h-10 w-10 items-center justify-center rounded-full">
                      <Package className="text-brand-1 h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-ink-1 font-medium capitalize">
                        {order.status.replace("_", " ")}
                      </p>
                      <p className="text-muted-1 text-sm">
                        {order.status === "pending"
                          ? "Your order is being processed"
                          : order.status === "confirmed"
                            ? "Your order has been confirmed"
                            : order.status === "processing"
                              ? "Your order is being prepared"
                              : order.status === "shipped"
                                ? "Your order is on the way"
                                : order.status === "delivered"
                                  ? "Your order has been delivered"
                                  : "Order status update"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Order Items */}
            <FadeIn delay={0.3}>
              <Card className="border border-black/5 bg-white/80">
                <CardHeader>
                  <CardTitle className="font-display text-ink-1 flex items-center gap-2 text-xl">
                    <ShoppingBag className="h-5 w-5" />
                    Order Items ({order.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StaggerContainer className="space-y-4">
                    {order.items.map((item) => (
                      <StaggerItem
                        key={item.id}
                        className="flex items-center justify-between border-b border-black/5 pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="text-ink-1 font-medium">
                            {item.productName}
                          </p>
                          <p className="text-muted-1 text-sm">
                            {Number(item.quantity)}{" "}
                            {formatUnit(item.unit, Number(item.quantity))} x{" "}
                            {formatPrice(Number(item.price))}
                          </p>
                        </div>
                        <p className="text-ink-1 font-medium">
                          {formatPrice(Number(item.total))}
                        </p>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Shipping Address */}
            <FadeIn delay={0.4}>
              <Card className="border border-black/5 bg-white/80">
                <CardHeader>
                  <CardTitle className="font-display text-ink-1 flex items-center gap-2 text-xl">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-ink-1 font-medium">
                      {shippingAddress.name}
                    </p>
                    <p className="text-muted-1">
                      {shippingAddress.addressLine1}
                      {shippingAddress.addressLine2 && (
                        <>, {shippingAddress.addressLine2}</>
                      )}
                    </p>
                    <p className="text-muted-1">
                      {shippingAddress.city}, {shippingAddress.state} -{" "}
                      {shippingAddress.pincode}
                    </p>
                    <div className="text-muted-1 flex items-center gap-2 pt-2">
                      <Phone className="h-4 w-4" />
                      <span>{shippingAddress.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <FadeIn delay={0.5}>
              <Card className="sticky top-24 border border-black/5 bg-white/80">
                <CardHeader>
                  <CardTitle className="font-display text-ink-1 text-xl">
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-1">Subtotal</span>
                    <span>{formatPrice(Number(order.subtotal))}</span>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="text-success-1 flex justify-between text-sm">
                      <span>Discount</span>
                      <span>-{formatPrice(Number(order.discount))}</span>
                    </div>
                  )}
                  {order.couponCode && (
                    <div className="text-muted-1 flex justify-between text-sm">
                      <span>Coupon</span>
                      <span className="text-ink-1 font-medium">
                        {order.couponCode}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-1">Shipping</span>
                    <span>{formatPrice(Number(order.shippingCost))}</span>
                  </div>
                  {Number(order.tax) > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-1">IGST (2.5%)</span>
                        <span>{formatPrice(Number(order.tax) / 2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-1">CGST (2.5%)</span>
                        <span>{formatPrice(Number(order.tax) / 2)}</span>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex justify-between">
                    <span className="text-ink-1 text-lg font-semibold">
                      Total
                    </span>
                    <span className="text-brand-1 text-lg font-semibold">
                      {formatPrice(Number(order.total))}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-black/5 bg-white/80 p-4">
                    <p className="text-muted-1 text-sm">
                      <span className="font-medium">Payment Method:</span>{" "}
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </p>
                    <p className="text-muted-1 mt-1 text-sm">
                      <span className="font-medium">Payment Status:</span>{" "}
                      <span
                        className={
                          order.paymentStatus === "paid"
                            ? "text-success-1"
                            : "text-brand-1"
                        }
                      >
                        {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      className="bg-brand-1 hover:bg-brand-2 w-full rounded-full"
                      asChild
                    >
                      <Link href="/account/orders">View All Orders</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="text-ink-1 w-full rounded-full border-black/10 bg-white/80 hover:bg-white"
                      asChild
                    >
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </div>

                  {/* Contact Info */}
                  <div className="text-muted-1 pt-4 text-center text-sm">
                    <p>Need help with your order?</p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a
                        href="mailto:support@namantextiles.com"
                        className="text-brand-1 hover:underline"
                      >
                        support@namantextiles.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
