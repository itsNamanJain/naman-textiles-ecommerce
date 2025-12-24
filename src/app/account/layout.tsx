"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
  Home,
  Loader2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

const accountNavItems = [
  {
    href: "/account",
    label: "My Profile",
    icon: User,
  },
  {
    href: "/account/orders",
    label: "My Orders",
    icon: Package,
  },
  {
    href: "/account/addresses",
    label: "Saved Addresses",
    icon: MapPin,
  },
  {
    href: "/account/wishlist",
    label: "Wishlist",
    icon: Heart,
  },
];

function LoadingState() {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    </div>
  );
}

function AccountLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/account");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "unauthenticated") {
    return <LoadingState />;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center text-gray-500 hover:text-amber-600"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">My Account</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <h1 className="mb-8 text-3xl font-bold text-gray-900">My Account</h1>
        </FadeIn>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  {accountNavItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/account" &&
                        pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 border-l-4 px-4 py-3 text-sm font-medium transition-colors",
                          isActive
                            ? "border-amber-600 bg-amber-50 text-amber-700"
                            : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 border-l-4 border-transparent px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LoadingState />;
  }

  return <AccountLayoutInner>{children}</AccountLayoutInner>;
}
