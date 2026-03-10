"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Smartphone,
  Copy,
  Check,
  ChevronRight,
  Home,
  Loader2,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/ui/motion";
import { formatPrice } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { STORE_INFO } from "@/lib/constants";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [utrSubmitted, setUtrSubmitted] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [upiUrl, setUpiUrl] = useState<string | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(true);

  const {
    data: order,
    isLoading,
    error,
  } = api.order.getById.useQuery({ id: orderId }, { enabled: !!orderId });

  const submitUtrMutation = api.order.submitUtr.useMutation({
    onSuccess: () => {
      setUtrSubmitted(true);
      toast.success("UTR submitted! We'll verify your payment shortly.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit UTR");
    },
  });

  // Pre-fill UTR if already submitted
  useEffect(() => {
    if (order?.utrNumber) {
      setUtrNumber(order.utrNumber);
      setUtrSubmitted(true);
    }
  }, [order]);

  // Generate QR code
  useEffect(() => {
    if (!order) return;

    const fetchQr = async () => {
      try {
        const response = await fetch(
          `/api/upi-qr?amount=${order.total}&orderId=${order.orderNumber}`
        );
        const data = (await response.json()) as {
          qrCode: string;
          upiUrl: string;
          upiId: string;
        };
        setQrCode(data.qrCode);
        setUpiUrl(data.upiUrl);
      } catch {
        console.error("Failed to load QR code");
      } finally {
        setIsLoadingQr(false);
      }
    };

    void fetchQr();
  }, [order]);

  const copyToClipboard = (text: string, type: "upi" | "amount") => {
    navigator.clipboard.writeText(text);
    if (type === "upi") {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  // If order is already paid or not UPI, redirect
  useEffect(() => {
    if (order && order.paymentStatus === "paid") {
      router.push(`/order-confirmation/${orderId}`);
    }
    if (order && order.paymentMethod !== "upi") {
      router.push(`/order-confirmation/${orderId}`);
    }
  }, [order, orderId, router]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-transparent">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="text-brand-1 h-12 w-12 animate-spin" />
            <p className="text-muted-1 mt-4">Loading payment details...</p>
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

  const totalAmount = Number(order.total);

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
            <span className="text-ink-1 font-medium">Complete Payment</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <FadeIn className="mb-8 text-center">
          <div className="bg-paper-1 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
            <Smartphone className="text-brand-1 h-12 w-12" />
          </div>
          <h1 className="font-display text-ink-1 text-3xl">
            Complete Your Payment
          </h1>
          <p className="text-muted-1 mt-2">
            Scan the QR code or use your UPI app to pay
          </p>
        </FadeIn>

        <div className="mx-auto max-w-2xl space-y-6">
          {/* Payment Amount */}
          <FadeIn delay={0.1}>
            <Card className="border border-black/5 bg-white/80">
              <CardContent className="flex items-center justify-between py-6">
                <div>
                  <p className="text-muted-1 text-sm">Order #{order.orderNumber}</p>
                  <p className="text-brand-1 text-3xl font-bold">
                    {formatPrice(totalAmount)}
                  </p>
                </div>
                <div className="bg-paper-1 flex items-center gap-2 rounded-full px-4 py-2">
                  <Clock className="text-brand-3 h-4 w-4" />
                  <span className="text-brand-3 text-sm font-medium">
                    Payment Pending
                  </span>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* QR Code & UPI Details */}
          <FadeIn delay={0.2}>
            <Card className="border border-black/5 bg-white/80">
              <CardHeader>
                <CardTitle className="font-display text-ink-1 text-center text-xl">
                  Scan & Pay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* QR Code */}
                <div className="flex justify-center">
                  {isLoadingQr ? (
                    <div className="flex h-[300px] w-[300px] items-center justify-center rounded-2xl border border-black/5 bg-white">
                      <Loader2 className="text-brand-1 h-8 w-8 animate-spin" />
                    </div>
                  ) : qrCode ? (
                    <div className="rounded-2xl border border-black/5 bg-white p-4">
                      <Image
                        src={qrCode}
                        alt="UPI QR Code"
                        width={300}
                        height={300}
                        className="h-[300px] w-[300px]"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-[300px] w-[300px] items-center justify-center rounded-2xl border border-black/5 bg-white">
                      <AlertCircle className="text-muted-3 h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Open UPI App button (mobile) */}
                {upiUrl && (
                  <div className="text-center">
                    <Button
                      className="bg-brand-1 hover:bg-brand-2 rounded-full md:hidden"
                      size="lg"
                      asChild
                    >
                      <a href={upiUrl}>
                        <Smartphone className="mr-2 h-5 w-5" />
                        Open UPI App & Pay
                      </a>
                    </Button>
                    <p className="text-muted-2 mt-2 text-xs md:hidden">
                      Opens your default UPI app
                    </p>
                  </div>
                )}

                <Separator />

                {/* UPI ID to copy */}
                <div className="space-y-3">
                  <p className="text-muted-1 text-center text-sm font-medium">
                    Or pay manually using UPI ID
                  </p>
                  <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/80 p-4">
                    <div>
                      <p className="text-muted-2 text-xs">UPI ID</p>
                      <p className="text-ink-1 font-mono text-lg font-semibold">
                        {STORE_INFO.upiId}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(STORE_INFO.upiId, "upi")
                      }
                      className="text-ink-1 gap-2 rounded-full border-black/10 bg-white/80 hover:bg-white"
                    >
                      {copiedUpi ? (
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
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/80 p-4">
                    <div>
                      <p className="text-muted-2 text-xs">Amount</p>
                      <p className="text-ink-1 font-mono text-lg font-semibold">
                        ₹{totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(totalAmount.toFixed(2), "amount")
                      }
                      className="text-ink-1 gap-2 rounded-full border-black/10 bg-white/80 hover:bg-white"
                    >
                      {copiedAmount ? (
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Instructions */}
          <FadeIn delay={0.3}>
            <Card className="border border-black/5 bg-white/80">
              <CardHeader>
                <CardTitle className="font-display text-ink-1 text-lg">
                  How to Pay
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-brand-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                      1
                    </div>
                    <p className="text-muted-1 text-sm">
                      Open any UPI app (GPay, PhonePe, Paytm, etc.)
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-brand-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                      2
                    </div>
                    <p className="text-muted-1 text-sm">
                      Scan the QR code above, or enter the UPI ID manually
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-brand-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                      3
                    </div>
                    <p className="text-muted-1 text-sm">
                      Enter amount{" "}
                      <span className="text-ink-1 font-semibold">
                        {formatPrice(totalAmount)}
                      </span>{" "}
                      and complete the payment
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-brand-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                      4
                    </div>
                    <p className="text-muted-1 text-sm">
                      After payment, enter your <span className="text-ink-1 font-semibold">UTR / Transaction ID</span> below for faster verification
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* UTR Submission */}
          <FadeIn delay={0.35}>
            <Card className="border border-black/5 bg-white/80">
              <CardHeader>
                <CardTitle className="font-display text-ink-1 text-lg">
                  Submit UTR / Transaction ID
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-1 text-sm">
                  After completing the payment, enter your UPI Transaction
                  Reference (UTR) number for faster verification. You can find
                  this in your UPI app&apos;s transaction history.
                </p>
                {utrSubmitted ? (
                  <div className="bg-success-2 flex items-center gap-3 rounded-2xl p-4">
                    <CheckCircle2 className="text-success-1 h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="text-success-1 text-sm font-medium">
                        UTR Submitted
                      </p>
                      <p className="text-success-1 font-mono text-sm">
                        {utrNumber}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter 12-digit UTR number"
                      value={utrNumber}
                      onChange={(e) =>
                        setUtrNumber(
                          e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
                        )
                      }
                      className="font-mono rounded-2xl border-black/10 bg-white/80 tracking-wider"
                      maxLength={50}
                    />
                    <Button
                      onClick={() => {
                        if (!utrNumber.trim()) {
                          toast.error("Please enter UTR number");
                          return;
                        }
                        if (utrNumber.length < 6) {
                          toast.error("UTR number must be at least 6 characters");
                          return;
                        }
                        submitUtrMutation.mutate({
                          orderId,
                          utrNumber: utrNumber.trim(),
                        });
                      }}
                      disabled={submitUtrMutation.isPending || !utrNumber.trim()}
                      className="bg-brand-1 hover:bg-brand-2 rounded-full"
                    >
                      {submitUtrMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Important Note */}
          <FadeIn delay={0.4}>
            <div className="bg-paper-1 rounded-2xl border border-black/5 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-brand-3 mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-ink-1 text-sm font-medium">Important</p>
                  <p className="text-muted-1 mt-1 text-sm">
                    Please pay the exact amount shown above. Your order will be
                    processed once we verify your payment. For any issues,
                    contact us on WhatsApp at{" "}
                    <a
                      href={`https://wa.me/${STORE_INFO.whatsapp.replace(/[+\s]/g, "")}`}
                      className="text-brand-1 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {STORE_INFO.phone}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Actions */}
          <FadeIn delay={0.45}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="bg-brand-1 hover:bg-brand-2 flex-1 rounded-full"
                size="lg"
                asChild
              >
                <Link href={`/order-confirmation/${orderId}`}>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  I&apos;ve Completed the Payment
                </Link>
              </Button>
              <Button
                variant="outline"
                className="text-ink-1 flex-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
                size="lg"
                asChild
              >
                <Link href="/account/orders">View My Orders</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
