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
];

function LoadingState() {
  return (
    <div className="bg-surface-1 flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="text-brand-1 mx-auto h-12 w-12 animate-spin" />
        <p className="text-muted-1 mt-4">Loading admin panel...</p>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="bg-surface-1 flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Shield className="text-danger-1 mx-auto h-16 w-16" />
        <h1 className="font-display text-ink-1 mt-4 text-2xl">Access Denied</h1>
        <p className="text-muted-1 mt-2">
          You don&apos;t have permission to access the admin panel.
        </p>
        <Button
          className="bg-brand-1 hover:bg-brand-2 mt-6 rounded-full"
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
    <div className="bg-surface-1 flex h-screen overflow-hidden">
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
          "bg-ink-0 fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Store className="text-sand-6 h-8 w-8" />
            <span className="font-display text-lg text-white">Naman Admin</span>
          </Link>
          <button
            className="text-warm-4 hover:text-white lg:hidden"
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
                        ? "bg-brand-1 text-white"
                        : "text-warm-5 hover:bg-white/10 hover:text-white"
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
              className="text-warm-5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/10 hover:text-white"
            >
              <Store className="h-5 w-5" />
              View Store
              <ChevronRight className="ml-auto h-4 w-4" />
            </Link>
            <button
              onClick={handleSignOut}
              className="text-rose-1 hover:text-rose-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/10"
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
            className="text-muted-1 hover:text-ink-1 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1" />

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-ink-1 text-sm font-medium">
                {session?.user?.name}
              </p>
              <p className="text-muted-2 text-xs">{session?.user?.email}</p>
            </div>
            <div className="bg-paper-1 text-brand-1 flex h-10 w-10 items-center justify-center rounded-full">
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
