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
            <Loader2 className="h-12 w-12 animate-spin text-[#b8743a]" />
            <p className="mt-4 text-[#6b5645]">Loading order details...</p>
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
            <Package className="h-16 w-16 text-[#b0896d]" />
            <h1 className="font-display mt-6 text-2xl text-[#2d1c12]">
              Order not found
            </h1>
            <p className="mt-2 text-[#6b5645]">
              We couldn&apos;t find the order you&apos;re looking for
            </p>
            <Button
              className="mt-8 rounded-full bg-[#b8743a] hover:bg-[#a4632f]"
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
              className="flex items-center text-[#9c826a] hover:text-[#b8743a]"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-[#2d1c12]">
              Order Confirmation
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <FadeIn className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#eaf4ea]">
            <CheckCircle2 className="h-12 w-12 text-[#2f6b3b]" />
          </div>
          <h1 className="font-display text-3xl text-[#2d1c12]">
            Thank you for your order!
          </h1>
          <p className="mt-2 text-[#6b5645]">
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
                    <p className="text-sm text-[#6b5645]">Order Number</p>
                    <p className="text-2xl font-semibold text-[#b8743a]">
                      {order.orderNumber}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyOrderNumber}
                    className="gap-2 rounded-full border-black/10 bg-white/80 text-[#2d1c12] hover:bg-white"
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
                  <CardTitle className="font-display flex items-center gap-2 text-xl text-[#2d1c12]">
                    <Truck className="h-5 w-5" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7efe7]">
                      <Package className="h-5 w-5 text-[#b8743a]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2d1c12] capitalize">
                        {order.status.replace("_", " ")}
                      </p>
                      <p className="text-sm text-[#6b5645]">
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
                  <CardTitle className="font-display flex items-center gap-2 text-xl text-[#2d1c12]">
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
                          <p className="font-medium text-[#2d1c12]">
                            {item.productName}
                          </p>
                          <p className="text-sm text-[#6b5645]">
                            {Number(item.quantity)}{" "}
                            {formatUnit(item.unit, Number(item.quantity))} x{" "}
                            {formatPrice(Number(item.price))}
                          </p>
                        </div>
                        <p className="font-medium text-[#2d1c12]">
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
                  <CardTitle className="font-display flex items-center gap-2 text-xl text-[#2d1c12]">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium text-[#2d1c12]">
                      {shippingAddress.name}
                    </p>
                    <p className="text-[#6b5645]">
                      {shippingAddress.addressLine1}
                      {shippingAddress.addressLine2 && (
                        <>, {shippingAddress.addressLine2}</>
                      )}
                    </p>
                    <p className="text-[#6b5645]">
                      {shippingAddress.city}, {shippingAddress.state} -{" "}
                      {shippingAddress.pincode}
                    </p>
                    <div className="flex items-center gap-2 pt-2 text-[#6b5645]">
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
                  <CardTitle className="font-display text-xl text-[#2d1c12]">
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b5645]">Subtotal</span>
                    <span>{formatPrice(Number(order.subtotal))}</span>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatPrice(Number(order.discount))}</span>
                    </div>
                  )}
                  {order.couponCode && (
                    <div className="flex justify-between text-sm text-[#6b5645]">
                      <span>Coupon</span>
                      <span className="font-medium text-[#2d1c12]">
                        {order.couponCode}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b5645]">Shipping</span>
                    <span>
                      {Number(order.shippingCost) === 0 ? (
                        <span className="text-emerald-600">FREE</span>
                      ) : (
                        formatPrice(Number(order.shippingCost))
                      )}
                    </span>
                  </div>
                  {Number(order.tax) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6b5645]">Tax</span>
                      <span>{formatPrice(Number(order.tax))}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-[#2d1c12]">
                      Total
                    </span>
                    <span className="text-lg font-semibold text-[#b8743a]">
                      {formatPrice(Number(order.total))}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-black/5 bg-white/80 p-4">
                    <p className="text-sm text-[#6b5645]">
                      <span className="font-medium">Payment Method:</span>{" "}
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </p>
                    <p className="mt-1 text-sm text-[#6b5645]">
                      <span className="font-medium">Payment Status:</span>{" "}
                      <span
                        className={
                          order.paymentStatus === "paid"
                            ? "text-emerald-600"
                            : "text-[#b8743a]"
                        }
                      >
                        {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      className="w-full rounded-full bg-[#b8743a] hover:bg-[#a4632f]"
                      asChild
                    >
                      <Link href="/account/orders">View All Orders</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-black/10 bg-white/80 text-[#2d1c12] hover:bg-white"
                      asChild
                    >
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </div>

                  {/* Contact Info */}
                  <div className="pt-4 text-center text-sm text-[#6b5645]">
                    <p>Need help with your order?</p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a
                        href="mailto:support@namantextiles.com"
                        className="text-[#b8743a] hover:underline"
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
