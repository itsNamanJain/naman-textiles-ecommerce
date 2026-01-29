"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Store,
  Loader2,
  Shield,
  Tag,
  Star,
  Image as ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminNavItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: Users,
  },
  {
    href: "/admin/coupons",
    label: "Coupons",
    icon: Tag,
  },
  {
    href: "/admin/banners",
    label: "Banners",
    icon: ImageIcon,
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: Star,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
];

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6efe6]">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#b8743a]" />
        <p className="mt-4 text-[#6b5645]">Loading admin panel...</p>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6efe6]">
      <div className="text-center">
        <Shield className="mx-auto h-16 w-16 text-[#b3474d]" />
        <h1 className="font-display mt-4 text-2xl text-[#2d1c12]">
          Access Denied
        </h1>
        <p className="mt-2 text-[#6b5645]">
          You don&apos;t have permission to access the admin panel.
        </p>
        <Button
          className="mt-6 rounded-full bg-[#b8743a] hover:bg-[#a4632f]"
          asChild
        >
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "unauthenticated") {
    return <LoadingState />;
  }

  // Check if user is admin
  if (session?.user?.role !== "admin") {
    return <AccessDenied />;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6efe6]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1c120c] transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Store className="h-8 w-8 text-[#e2b377]" />
            <span className="font-display text-lg text-white">Naman Admin</span>
          </Link>
          <button
            className="text-[#c4b1a2] hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col overflow-y-auto p-4">
          <ul className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#b8743a] text-white"
                        : "text-[#d9c8b8] hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Bottom section */}
          <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#d9c8b8] hover:bg-white/10 hover:text-white"
            >
              <Store className="h-5 w-5" />
              View Store
              <ChevronRight className="ml-auto h-4 w-4" />
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#e08a8f] hover:bg-white/10 hover:text-[#f0b5b8]"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content - offset by sidebar width on desktop */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top header - sticky within main content area */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-black/5 bg-white/80 px-4 shadow-[0_8px_30px_rgba(15,15,15,0.04)] backdrop-blur">
          <button
            className="text-[#6b5645] hover:text-[#2d1c12] lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1" />

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[#2d1c12]">
                {session?.user?.name}
              </p>
              <p className="text-xs text-[#9c826a]">{session?.user?.email}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7efe7] text-[#b8743a]">
              {session?.user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
          </div>
        </header>

        {/* Page content - scrollable */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
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

  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}
