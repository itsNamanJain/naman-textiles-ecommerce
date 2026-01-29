"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User, Mail, Phone, Loader2, Save, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/ui/motion";
import { toast } from "sonner";
import { api } from "@/trpc/react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: profile, isLoading } = api.auth.getProfile.useQuery();
  const utils = api.useUtils();

  const updateProfile = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      utils.auth.getProfile.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    updateProfile.mutate({
      name: data.name,
      phone: data.phone,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border border-black/5 bg-white/80">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <Card className="border border-black/5 bg-white/80">
          <CardHeader>
            <CardTitle className="font-display text-ink-1 flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-muted-1">
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-3" />
                            <Input
                              className="rounded-2xl border-black/10 bg-white/80 pl-10"
                              placeholder="Your name"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-3" />
                            <Input
                              className="rounded-2xl border-black/10 bg-white/80 pl-10"
                              type="email"
                              placeholder="your@email.com"
                              disabled
                              {...field}
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-3" />
                          <Input
                            className="rounded-2xl border-black/10 bg-white/80 pl-10"
                            placeholder="+91 98765 43210"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="bg-brand-1 hover:bg-brand-2 rounded-full"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : updateProfile.isSuccess ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Updated!
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Account Statistics */}
      <FadeIn delay={0.2}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border border-black/5 bg-white/80">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-brand-1 text-3xl font-semibold">
                  {profile?.stats.totalOrders ?? 0}
                </p>
                <p className="text-muted-1 mt-1 text-sm">Total Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-black/5 bg-white/80">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-brand-1 text-3xl font-semibold">
                  {profile?.stats.wishlistItems ?? 0}
                </p>
                <p className="text-muted-1 mt-1 text-sm">Wishlist Items</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-black/5 bg-white/80">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-brand-1 text-3xl font-semibold">
                  {profile?.stats.savedAddresses ?? 0}
                </p>
                <p className="text-muted-1 mt-1 text-sm">Saved Addresses</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </div>
  );
}
