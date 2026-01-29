"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ChevronRight,
  Home,
  ShoppingCart,
  CreditCard,
  Truck,
  Loader2,
  CheckCircle,
  Lock,
  MapPin,
  Plus,
  Tag,
  X,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { FadeIn } from "@/components/ui/motion";
import { formatPrice, formatUnit, formatQuantity } from "@/lib/utils";
import { cartStore } from "@/stores";
import { useXStateSelector } from "@/hooks";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { DEFAULT_SETTINGS } from "@/lib/constants";

// Indian states list
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const checkoutSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  addressLine1: z
    .string()
    .min(10, "Please enter a complete address")
    .max(200, "Address is too long"),
  addressLine2: z.string().max(200, "Address is too long").optional(),
  city: z
    .string()
    .min(2, "City name is required")
    .max(50, "City name is too long")
    .regex(/^[a-zA-Z\s]+$/, "City name can only contain letters"),
  state: z.string().min(1, "Please select a state"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"),
  paymentMethod: z.enum(["cod", "online"]),
  customerNote: z.string().max(500, "Note is too long").optional(),
  saveAddress: z.boolean(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-transparent">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-[#b8743a]" />
          <p className="mt-4 text-[#6b5645]">Loading checkout...</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Only call hooks after mounting to avoid SSR issues
  useEffect(() => {
    setIsMounted(true);
    cartStore.send({ type: "hydrate" });
  }, []);

  // Show loading until mounted on client
  if (!isMounted) {
    return <LoadingSpinner />;
  }

  return <CheckoutContent />;
}

function CheckoutContent() {
  const router = useRouter();
  const { status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationOrderId, setConfirmationOrderId] = useState<string | null>(
    null
  );
  const [serverTotals, setServerTotals] = useState<{
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
  } | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    couponId: string;
    code: string;
    discount: number;
    description?: string | null;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const { items } = useXStateSelector(cartStore, ({ context }) => context);
  const { data: settings } = api.settings.getPublicSettings.useQuery();
  const { data: savedAddresses, isLoading: isLoadingAddresses } =
    api.address.getAll.useQuery(undefined, {
      enabled: status === "authenticated",
    });

  const utils = api.useUtils();

  // Get settings from DB or use defaults
  const freeShippingThreshold = Number(
    settings?.shippingFreeThreshold ?? DEFAULT_SETTINGS.shippingFreeThreshold
  );
  const shippingRate = Number(
    settings?.shippingBaseRate ?? DEFAULT_SETTINGS.shippingBaseRate
  );
  const minOrderAmount = Number(
    settings?.orderMinAmount ?? DEFAULT_SETTINGS.orderMinAmount
  );
  const codEnabled =
    (settings?.codEnabled ?? DEFAULT_SETTINGS.codEnabled) === "true";
  const onlinePaymentEnabled =
    (settings?.onlinePaymentEnabled ??
      DEFAULT_SETTINGS.onlinePaymentEnabled) === "true";

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingRate;
  const discount = appliedCoupon?.discount ?? 0;
  const total = subtotal + shipping - discount;

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      paymentMethod: "cod",
      customerNote: "",
      saveAddress: false,
    },
  });

  const fillFormWithAddress = useCallback(
    (address: NonNullable<typeof savedAddresses>[0]) => {
      form.setValue("name", address.name);
      form.setValue("phone", address.phone);
      form.setValue("addressLine1", address.addressLine1);
      form.setValue("addressLine2", address.addressLine2 ?? "");
      form.setValue("city", address.city);
      form.setValue("state", address.state);
      form.setValue("pincode", address.pincode);
    },
    [form]
  );

  // Set default payment method based on what's enabled
  useEffect(() => {
    if (codEnabled) {
      form.setValue("paymentMethod", "cod");
    } else if (onlinePaymentEnabled) {
      form.setValue("paymentMethod", "online");
    }
  }, [codEnabled, onlinePaymentEnabled, form]);

  // When saved addresses load, select the default one
  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0 && !selectedAddressId) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        fillFormWithAddress(defaultAddr);
      } else if (savedAddresses[0]) {
        setSelectedAddressId(savedAddresses[0].id);
        fillFormWithAddress(savedAddresses[0]);
      }
    } else if (savedAddresses && savedAddresses.length === 0) {
      setIsNewAddress(true);
    }
  }, [fillFormWithAddress, savedAddresses, selectedAddressId]);

  const handleSelectAddress = (addressId: string) => {
    if (addressId === "new") {
      setSelectedAddressId(null);
      setIsNewAddress(true);
      form.reset({
        name: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        paymentMethod: form.getValues("paymentMethod"),
        customerNote: form.getValues("customerNote"),
        saveAddress: true,
      });
    } else {
      setIsNewAddress(false);
      setSelectedAddressId(addressId);
      const addr = savedAddresses?.find((a) => a.id === addressId);
      if (addr) {
        fillFormWithAddress(addr);
        form.setValue("saveAddress", false);
      }
    }
  };

  const createAddressMutation = api.address.create.useMutation({
    onSuccess: () => {
      utils.address.getAll.invalidate();
    },
  });

  const validateCouponMutation = api.coupon.validate.useMutation({
    onSuccess: (data) => {
      setAppliedCoupon({
        couponId: data.couponId,
        code: data.code,
        discount: data.discount,
        description: data.description,
      });
      setCouponCode("");
      toast.success(`Coupon applied! You save ${formatPrice(data.discount)}`);
    },
    onError: (error) => {
      toast.error(error.message || "Invalid coupon code");
    },
    onSettled: () => {
      setIsValidatingCoupon(false);
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    setIsValidatingCoupon(true);
    validateCouponMutation.mutate({
      code: couponCode,
      subtotal,
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  const createOrderMutation = api.order.create.useMutation({
    onSuccess: async (data) => {
      cartStore.send({ type: "clearCart" });
      if (data.totals && typeof data.totals.total === "number") {
        setServerTotals({
          subtotal: data.totals.subtotal,
          shippingCost: data.totals.shippingCost,
          discount: data.totals.discount,
          total: data.totals.total,
        });
      }
      setConfirmationOrderId(data.orderId);
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to place order");
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (status !== "authenticated") {
      toast.error("Please sign in to place an order");
      router.push("/auth/signin?callbackUrl=/checkout");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (subtotal < minOrderAmount) {
      toast.error(`Minimum order amount is ${formatPrice(minOrderAmount)}`);
      return;
    }

    setIsSubmitting(true);

    // Save address if requested
    if (isNewAddress && data.saveAddress) {
      try {
        await createAddressMutation.mutateAsync({
          name: data.name,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          isDefault: !savedAddresses || savedAddresses.length === 0,
        });
      } catch {
        // Continue with order even if address save fails
      }
    }

    createOrderMutation.mutate({
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        unit: item.unit,
      })),
      shippingAddress: {
        name: data.name,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      },
      paymentMethod: data.paymentMethod,
      customerNote: data.customerNote,
      couponCode: appliedCoupon?.code,
    });
  };

  // Show loading while session is loading
  if (status === "loading") {
    return <LoadingSpinner />;
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-transparent">
        <div className="container mx-auto px-4 py-12">
          <FadeIn className="flex flex-col items-center justify-center py-16">
            <Lock className="h-16 w-16 text-[#b0896d]" />
            <h1 className="font-display mt-6 text-2xl text-[#2d1c12]">
              Sign in to checkout
            </h1>
            <p className="mt-2 text-[#6b5645]">
              Please sign in to complete your purchase
            </p>
            <Button
              className="mt-8 rounded-full bg-[#b8743a] hover:bg-[#a4632f]"
              size="lg"
              asChild
            >
              <Link href="/auth/signin?callbackUrl=/checkout">Sign In</Link>
            </Button>
          </FadeIn>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-transparent">
        <div className="container mx-auto px-4 py-12">
          <FadeIn className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-16 w-16 text-[#b0896d]" />
            <h1 className="font-display mt-6 text-2xl text-[#2d1c12]">
              Your cart is empty
            </h1>
            <p className="mt-2 text-[#6b5645]">
              Add some products to your cart before checkout
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

  return (
    <div className="min-h-screen bg-transparent">
      <Dialog
        open={!!confirmationOrderId}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmationOrderId(null);
            setServerTotals(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-[#2d1c12]">
              Order placed
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[#6b5645]">
              We&apos;ve verified your total on the server.
            </p>
            {serverTotals && (
              <div className="space-y-2 rounded-2xl border border-black/5 bg-white/80 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6b5645]">Subtotal</span>
                  <span>{formatPrice(serverTotals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b5645]">Shipping</span>
                  <span>
                    {serverTotals.shippingCost === 0
                      ? "FREE"
                      : formatPrice(serverTotals.shippingCost)}
                  </span>
                </div>
                {serverTotals.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatPrice(serverTotals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold text-[#2d1c12]">
                  <span>Total</span>
                  <span className="text-[#b8743a]">
                    {formatPrice(serverTotals.total)}
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                className="flex-1 rounded-full bg-[#b8743a] hover:bg-[#a4632f]"
                onClick={() =>
                  confirmationOrderId &&
                  router.push(`/order-confirmation/${confirmationOrderId}`)
                }
              >
                View Order
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-full border-black/10 bg-white/80 text-[#2d1c12] hover:bg-white"
                onClick={() => {
                  setConfirmationOrderId(null);
                  setServerTotals(null);
                  router.push("/products");
                }}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
            <Link href="/cart" className="text-[#9c826a] hover:text-[#b8743a]">
              Cart
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-[#2d1c12]">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <h1 className="font-display mb-8 text-3xl text-[#2d1c12]">
            Checkout
          </h1>
        </FadeIn>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Shipping & Payment Form */}
              <div className="space-y-6 lg:col-span-2">
                {/* Saved Addresses */}
                {savedAddresses && savedAddresses.length > 0 && (
                  <Card className="border border-black/5 bg-white/80">
                    <CardHeader>
                      <CardTitle className="font-display flex items-center gap-2 text-xl text-[#2d1c12]">
                        <MapPin className="h-5 w-5" />
                        Select Delivery Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {savedAddresses.map((address) => (
                          <div
                            key={address.id}
                            onClick={() => handleSelectAddress(address.id)}
                            className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all hover:border-[#b8743a] ${
                              selectedAddressId === address.id && !isNewAddress
                                ? "border-[#b8743a] bg-[#f7efe7]"
                                : "border-black/10"
                            }`}
                          >
                            {selectedAddressId === address.id &&
                              !isNewAddress && (
                                <div className="absolute top-2 right-2">
                                  <Check className="h-5 w-5 text-[#b8743a]" />
                                </div>
                              )}
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-[#2d1c12]">
                                {address.name}
                              </p>
                              {address.isDefault && (
                                <span className="rounded-full bg-[#f7efe7] px-2 py-0.5 text-xs font-semibold text-[#8a6642]">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-[#6b5645]">
                              {address.addressLine1}
                              {address.addressLine2 &&
                                `, ${address.addressLine2}`}
                            </p>
                            <p className="text-sm text-[#6b5645]">
                              {address.city}, {address.state} -{" "}
                              {address.pincode}
                            </p>
                            <p className="mt-1 text-sm text-[#9c826a]">
                              +91 {address.phone}
                            </p>
                          </div>
                        ))}
                        <div
                          onClick={() => handleSelectAddress("new")}
                          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 transition-all hover:border-[#b8743a] ${
                            isNewAddress
                              ? "border-[#b8743a] bg-[#f7efe7]"
                              : "border-black/20"
                          }`}
                        >
                          <Plus className="h-8 w-8 text-[#9c826a]" />
                          <span className="mt-2 text-sm font-medium text-[#6b5645]">
                            Add New Address
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Shipping Address Form */}
                <Card className="border border-black/5 bg-white/80">
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2 text-xl text-[#2d1c12]">
                      <Truck className="h-5 w-5" />
                      {savedAddresses &&
                      savedAddresses.length > 0 &&
                      !isNewAddress
                        ? "Delivery Address"
                        : "Shipping Address"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoadingAddresses ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[#b8743a]" />
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="John Doe"
                                    disabled={
                                      !isNewAddress && !!selectedAddressId
                                    }
                                    className="rounded-2xl border-black/10 bg-white/80"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
                                      +91
                                    </span>
                                    <Input
                                      placeholder="9876543210"
                                      className="rounded-2xl border-black/10 bg-white/80 pl-12"
                                      inputMode="numeric"
                                      maxLength={10}
                                      disabled={
                                        !isNewAddress && !!selectedAddressId
                                      }
                                      {...field}
                                      onChange={(e) => {
                                        const value = e.target.value.replace(
                                          /\D/g,
                                          ""
                                        );
                                        field.onChange(value);
                                      }}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="addressLine1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 1</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="House/Flat No., Building Name"
                                  disabled={
                                    !isNewAddress && !!selectedAddressId
                                  }
                                  className="rounded-2xl border-black/10 bg-white/80"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="addressLine2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 2 (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Street, Landmark"
                                  disabled={
                                    !isNewAddress && !!selectedAddressId
                                  }
                                  className="rounded-2xl border-black/10 bg-white/80"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid gap-4 sm:grid-cols-3">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Delhi"
                                    disabled={
                                      !isNewAddress && !!selectedAddressId
                                    }
                                    className="rounded-2xl border-black/10 bg-white/80"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  disabled={
                                    !isNewAddress && !!selectedAddressId
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger className="rounded-2xl border-black/10 bg-white/80">
                                      <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {INDIAN_STATES.map((state) => (
                                      <SelectItem key={state} value={state}>
                                        {state}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="pincode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pincode</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="110031"
                                    inputMode="numeric"
                                    maxLength={6}
                                    disabled={
                                      !isNewAddress && !!selectedAddressId
                                    }
                                    className="rounded-2xl border-black/10 bg-white/80"
                                    {...field}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(
                                        /\D/g,
                                        ""
                                      );
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Save address toggle for new addresses */}
                        {isNewAddress && (
                          <FormField
                            control={form.control}
                            name="saveAddress"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/80 p-4">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="flex-1">
                                  <FormLabel className="text-base font-medium text-[#2d1c12]">
                                    Save this address
                                  </FormLabel>
                                  <p className="text-sm text-[#6b5645]">
                                    Save to your address book for faster
                                    checkout
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Method - Only show if at least one option is enabled */}
                {(codEnabled || onlinePaymentEnabled) && (
                  <Card className="border border-black/5 bg-white/80">
                    <CardHeader>
                      <CardTitle className="font-display flex items-center gap-2 text-xl text-[#2d1c12]">
                        <CreditCard className="h-5 w-5" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-3"
                              >
                                {codEnabled && (
                                  <div className="flex cursor-pointer items-center space-x-3 rounded-2xl border border-black/10 bg-white/80 p-4 transition-colors hover:bg-white">
                                    <RadioGroupItem value="cod" id="cod" />
                                    <Label
                                      htmlFor="cod"
                                      className="flex-1 cursor-pointer"
                                    >
                                      <div className="font-medium text-[#2d1c12]">
                                        Cash on Delivery
                                      </div>
                                      <div className="text-sm text-[#6b5645]">
                                        Pay when you receive your order
                                      </div>
                                    </Label>
                                  </div>
                                )}
                                {onlinePaymentEnabled && (
                                  <div className="flex cursor-pointer items-center space-x-3 rounded-2xl border border-black/10 bg-white/80 p-4 transition-colors hover:bg-white">
                                    <RadioGroupItem
                                      value="online"
                                      id="online"
                                    />
                                    <Label
                                      htmlFor="online"
                                      className="flex-1 cursor-pointer"
                                    >
                                      <div className="font-medium text-[#2d1c12]">
                                        Online Payment
                                      </div>
                                      <div className="text-sm text-[#6b5645]">
                                        UPI, Cards, Net Banking
                                      </div>
                                    </Label>
                                  </div>
                                )}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Order Notes */}
                <Card className="border border-black/5 bg-white/80">
                  <CardHeader>
                    <CardTitle className="font-display text-xl text-[#2d1c12]">
                      Order Notes (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="customerNote"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <textarea
                              className="w-full rounded-2xl border border-black/10 bg-white/80 p-3 text-sm focus:border-[#b8743a] focus:ring-1 focus:ring-[#b8743a] focus:outline-none"
                              rows={3}
                              placeholder="Any special instructions for your order..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <FadeIn delay={0.2}>
                  <Card className="sticky top-24 border border-black/5 bg-white/80">
                    <CardHeader>
                      <CardTitle className="font-display text-xl text-[#2d1c12]">
                        Order Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Items */}
                      <div className="max-h-64 space-y-3 overflow-y-auto">
                        {items.map((item) => (
                          <div key={item.productId} className="flex gap-3">
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-black/5 bg-[#f5efe7]">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <ShoppingCart className="h-6 w-6 text-[#b0896d]" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="line-clamp-1 text-sm font-medium text-[#2d1c12]">
                                {item.name}
                              </p>
                              <p className="text-xs text-[#9c826a]">
                                {formatQuantity(item.quantity, item.unit)}{" "}
                                {formatUnit(item.unit, item.quantity)} x{" "}
                                {formatPrice(item.price)}
                              </p>
                              <p className="text-sm font-medium text-[#2d1c12]">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Coupon Code */}
                      <div className="space-y-3">
                        {appliedCoupon ? (
                          <div className="flex items-center justify-between rounded-2xl bg-[#eaf4ea] p-3">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-emerald-700" />
                              <div>
                                <p className="text-sm font-medium text-emerald-800">
                                  {appliedCoupon.code}
                                </p>
                                {appliedCoupon.description && (
                                  <p className="text-xs text-emerald-700">
                                    {appliedCoupon.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveCoupon}
                              className="h-8 w-8 p-0 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Tag className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9c826a]" />
                              <Input
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={(e) =>
                                  setCouponCode(e.target.value.toUpperCase())
                                }
                                className="rounded-2xl border-black/10 bg-white/80 pl-10"
                                disabled={isValidatingCoupon}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleApplyCoupon}
                              disabled={
                                isValidatingCoupon || !couponCode.trim()
                              }
                              className="rounded-full border-black/10 bg-white/80 text-[#2d1c12] hover:bg-white"
                            >
                              {isValidatingCoupon ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Apply"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Totals */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#6b5645]">Subtotal</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#6b5645]">Shipping</span>
                          <span>
                            {shipping === 0 ? (
                              <span className="text-emerald-600">FREE</span>
                            ) : (
                              formatPrice(shipping)
                            )}
                          </span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-600">Discount</span>
                            <span className="text-emerald-600">
                              -{formatPrice(discount)}
                            </span>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-[#2d1c12]">
                          Total
                        </span>
                        <span className="text-lg font-semibold text-[#b8743a]">
                          {formatPrice(total)}
                        </span>
                      </div>

                      <Button
                        type="submit"
                        className="w-full rounded-full bg-[#b8743a] hover:bg-[#a4632f]"
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Placing Order...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Place Order
                          </>
                        )}
                      </Button>

                      <p className="text-center text-xs text-[#9c826a]">
                        By placing this order, you agree to our Terms &
                        Conditions
                      </p>
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
