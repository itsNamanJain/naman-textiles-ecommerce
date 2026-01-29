"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/ui/motion";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { env } from "@/env";

const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const isGoogleEnabled = env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signUpMutation = api.auth.signUp.useMutation({
    onSuccess: async () => {
      toast.success("Account created successfully!");
      // Auto sign in after signup
      const formData = form.getValues();
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.ok) {
        router.push("/");
        router.refresh();
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create account");
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    signUpMutation.mutate({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      toast.error("Failed to sign in with Google");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <FadeIn className="w-full max-w-md">
        <Card className="border border-black/5 bg-white/85 shadow-[0_30px_80px_rgba(15,15,15,0.12)]">
          <CardHeader className="space-y-1 text-center">
            <h1 className="font-display text-ink-1 text-2xl">Create Account</h1>
            <p className="text-muted-1 text-sm">
              Join Naman Textiles for exclusive deals and offers
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {isGoogleEnabled && (
              <>
                {/* Google Sign Up */}
                <Button
                  type="button"
                  variant="outline"
                  className="text-ink-1 w-full rounded-full border-black/10 bg-white/80 hover:bg-white"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>

                <div className="relative">
                  <Separator />
                  <span className="text-muted-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs">
                    or register with email
                  </span>
                </div>
              </>
            )}

            {/* Sign Up Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                            placeholder="John Doe"
                            className="rounded-2xl border-black/10 bg-white/80 pl-10"
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-3" />
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="rounded-2xl border-black/10 bg-white/80 pl-10"
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-3" />
                          <Input
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="rounded-2xl border-black/10 bg-white/80 pl-10"
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-3" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="rounded-2xl border-black/10 bg-white/80 pr-10 pl-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-2 hover:text-muted-1 absolute top-1/2 right-3 -translate-y-1/2"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-3" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="rounded-2xl border-black/10 bg-white/80 pr-10 pl-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="text-muted-2 hover:text-muted-1 absolute top-1/2 right-3 -translate-y-1/2"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="bg-brand-1 hover:bg-brand-2 w-full rounded-full"
                  disabled={signUpMutation.isPending}
                >
                  {signUpMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            <p className="text-muted-1 text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-brand-1 font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>

            <p className="text-muted-2 text-center text-xs">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="hover:text-brand-1 underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="hover:text-brand-1 underline">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
