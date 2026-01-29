"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  Phone,
  MapPin,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "@/components/ui/motion";
import { cn } from "@/lib/utils";
import { cartStore } from "@/stores";
import { useXStateSelector } from "@/hooks";
import { SearchDialog } from "./search-dialog";
import { api } from "@/trpc/react";
import { STORE_INFO } from "@/lib/constants";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user?.role === "admin";

  const { data: categories } = api.category.getAll.useQuery();
  const displayCategories = categories ?? [];

  // Get wishlist count only if authenticated
  const { data: wishlistCount } = api.wishlist.count.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { items } = useXStateSelector(cartStore, ({ context }) => context);

  // Only calculate cart count after component mounts to avoid hydration mismatch
  // Show number of unique items in cart (not sum of quantities)
  const cartItemCount = isMounted ? items.length : 0;

  useEffect(() => {
    setIsMounted(true);
    cartStore.send({ type: "hydrate" });
  }, []);

  const handleCartClick = () => {
    cartStore.send({ type: "openCart" });
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 shadow-[0_8px_30px_rgba(15,15,15,0.04)] backdrop-blur">
        {/* Top Bar */}
        <div className="from-paper-5 to-paper-6 hidden border-b border-black/5 bg-gradient-to-r via-white md:block">
          <div className="text-muted-4 container mx-auto flex items-center justify-between px-4 py-2 text-xs font-medium tracking-wide uppercase">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{STORE_INFO.phone}</span>
              </div>
              <a
                href={STORE_INFO.address.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-1 flex items-center gap-2 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                <span>{STORE_INFO.address.city}</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/track-order" className="hover:text-brand-1">
                Track Order
              </Link>
              <Link href="/contact" className="hover:text-brand-1">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4 md:h-20">
            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="size-9">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="font-display text-ink-1 text-left text-xl">
                    Naman Textiles
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-4">
                  <Link
                    href="/"
                    className="text-ink-1 hover:text-brand-1 text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/products"
                    className="text-ink-1 hover:text-brand-1 text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    All Products
                  </Link>
                  <div className="border-t pt-4">
                    <span className="text-muted-2 mb-3 block text-xs font-semibold tracking-[0.2em] uppercase">
                      Categories
                    </span>
                    {displayCategories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        className="text-ink-1 hover:text-brand-1 block py-2 text-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    {isAuthenticated ? (
                      <>
                        <div className="text-ink-1 py-2 text-sm font-medium">
                          {session?.user?.name || session?.user?.email}
                        </div>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="text-brand-1 hover:text-brand-2 flex items-center gap-2 py-2 font-medium"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link
                          href="/account"
                          className="text-ink-1 hover:text-brand-1 block py-2 text-sm"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          className="text-ink-1 hover:text-brand-1 block py-2 text-sm"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/account/wishlist"
                          className="text-ink-1 hover:text-brand-1 block py-2 text-sm"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Wishlist
                        </Link>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="text-danger-1 hover:text-danger-2 block w-full py-2 text-left"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/signin"
                          className="text-ink-1 hover:text-brand-1 block py-2 text-sm"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/auth/signup"
                          className="text-ink-1 hover:text-brand-1 block py-2 text-sm"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="font-display text-ink-1 text-xl font-semibold tracking-wide md:text-2xl"
              >
                Naman Textiles
              </motion.div>
            </Link>

            {/* Search Bar - Desktop (Clickable to open dialog) */}
            <div className="hidden flex-1 items-center justify-center px-8 md:flex">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="relative w-full max-w-xl"
              >
                <div className="text-muted-2 flex w-full items-center rounded-full border border-black/10 bg-white/90 py-2.5 pr-4 pl-12 text-left text-sm shadow-[0_10px_30px_rgba(15,15,15,0.05)] transition-all hover:border-black/20 hover:bg-white">
                  Search fabrics, categories, styles...
                </div>
                <Search className="text-muted-3 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Search Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist - Only show when logged in */}
              {isAuthenticated && (
                <Link href="/account/wishlist">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-black/5"
                  >
                    <Heart className="h-5 w-5" />
                    {wishlistCount && wishlistCount > 0 && (
                      <span className="bg-danger-4 absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-black/5"
                onClick={handleCartClick}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="bg-brand-1 absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-black/5"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAuthenticated ? (
                    <>
                      <div className="text-ink-1 px-2 py-1.5 text-sm font-medium">
                        {session?.user?.name || session?.user?.email}
                      </div>
                      <DropdownMenuSeparator />
                      {isAdmin && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="text-brand-1">
                              <Shield className="mr-2 h-4 w-4" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href="/account">My Account</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/orders">My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/wishlist">Wishlist</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-danger-4 focus:text-danger-4"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/signin">Sign In</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/signup">Create Account</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Category Navigation - Desktop */}
        <nav className="hidden border-t border-black/5 bg-white/70 md:block">
          <div className="container mx-auto px-4">
            <ul className="flex items-center justify-center gap-2 py-1.5">
              <li>
                <Link
                  href="/products"
                  className={cn(
                    "text-muted-1 rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-colors",
                    "hover:bg-paper-1 hover:text-brand-1"
                  )}
                >
                  All Products
                </Link>
              </li>
              {displayCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/category/${category.slug}`}
                    className={cn(
                      "text-muted-1 rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-colors",
                      "hover:bg-paper-1 hover:text-brand-1"
                    )}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Search Dialog */}
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
