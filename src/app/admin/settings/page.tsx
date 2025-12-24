"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  IndianRupee,
  Save,
  Loader2,
  CheckCircle,
  CreditCard,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/ui/motion";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { DEFAULT_SETTINGS } from "@/lib/constants";

type SettingsType = {
  shippingFreeThreshold: string;
  shippingBaseRate: string;
  orderMinAmount: string;
  codEnabled: string;
  onlinePaymentEnabled: string;
};

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState<SettingsType>({
    ...DEFAULT_SETTINGS,
  });
  const [hasChanges, setHasChanges] = useState(false);

  const { data: savedSettings, isLoading } = api.admin.getSettings.useQuery();
  const updateSettings = api.admin.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully");
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error("Failed to save settings: " + error.message);
    },
  });

  // Load saved settings
  useEffect(() => {
    if (savedSettings) {
      setFormData((prev) => ({
        ...prev,
        ...savedSettings,
      }));
    }
  }, [savedSettings]);

  const handleChange = (key: keyof SettingsType, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings.mutate({ settings: formData });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-gray-500">
              Configure shipping and payment settings
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateSettings.isPending}
          >
            {updateSettings.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : hasChanges ? (
              <Save className="mr-2 h-4 w-4" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {updateSettings.isPending
              ? "Saving..."
              : hasChanges
                ? "Save Changes"
                : "Saved"}
          </Button>
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shipping Settings */}
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Settings
              </CardTitle>
              <CardDescription>
                Configure shipping rates and free shipping threshold
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shippingFreeThreshold">
                  Free Shipping Threshold
                </Label>
                <div className="relative">
                  <IndianRupee className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="shippingFreeThreshold"
                    type="number"
                    value={formData.shippingFreeThreshold}
                    onChange={(e) =>
                      handleChange("shippingFreeThreshold", e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Orders above this amount get free shipping
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingBaseRate">Shipping Rate</Label>
                <div className="relative">
                  <IndianRupee className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="shippingBaseRate"
                    type="number"
                    value={formData.shippingBaseRate}
                    onChange={(e) =>
                      handleChange("shippingBaseRate", e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Flat shipping rate for orders below free shipping threshold
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Order & Payment Settings */}
        <FadeIn delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order & Payment Settings
              </CardTitle>
              <CardDescription>
                Configure order limits and payment options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderMinAmount">Minimum Order Amount</Label>
                <div className="relative">
                  <IndianRupee className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="orderMinAmount"
                    type="number"
                    value={formData.orderMinAmount}
                    onChange={(e) =>
                      handleChange("orderMinAmount", e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Customers must order at least this amount
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cash on Delivery</Label>
                  <p className="text-xs text-gray-500">
                    Allow customers to pay on delivery
                  </p>
                </div>
                <Switch
                  checked={formData.codEnabled === "true"}
                  onCheckedChange={(checked) =>
                    handleChange("codEnabled", checked ? "true" : "false")
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Online Payment</Label>
                  <p className="text-xs text-gray-500">
                    Accept online payments (UPI, Cards, etc.)
                  </p>
                </div>
                <Switch
                  checked={formData.onlinePaymentEnabled === "true"}
                  onCheckedChange={(checked) =>
                    handleChange(
                      "onlinePaymentEnabled",
                      checked ? "true" : "false"
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Save Button (Mobile) */}
      <FadeIn delay={0.2}>
        <div className="lg:hidden">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateSettings.isPending}
            className="w-full"
          >
            {updateSettings.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </FadeIn>
    </div>
  );
}
