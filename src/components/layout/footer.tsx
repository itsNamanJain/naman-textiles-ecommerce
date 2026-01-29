"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { STORE_INFO, DEFAULT_SETTINGS } from "@/lib/constants";

// Custom social icons (since lucide brand icons are deprecated)
const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const quickLinks = [
  { name: "All Products", href: "/products" },
  { name: "Contact Us", href: "/contact" },
  { name: "Track Order", href: "/track-order" },
];

const customerService = [
  { name: "My Account", href: "/account" },
  { name: "My Orders", href: "/account/orders" },
  { name: "Wishlist", href: "/account/wishlist" },
  { name: "Saved Addresses", href: "/account/addresses" },
];

export function Footer() {
  const { data: categories } = api.category.getAll.useQuery();
  const displayCategories = categories ?? [];

  const codEnabled = DEFAULT_SETTINGS.codEnabled === "true";
  const onlinePaymentEnabled = DEFAULT_SETTINGS.onlinePaymentEnabled === "true";

  // Build payment methods list based on defaults
  const paymentMethods: string[] = [];
  if (onlinePaymentEnabled) {
    paymentMethods.push("UPI", "Cards", "Net Banking");
  }
  if (codEnabled) {
    paymentMethods.push("COD");
  }

  return (
    <footer className="bg-ink-0 text-paper-20">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <h2 className="font-display mb-4 text-2xl font-semibold text-white">
              {STORE_INFO.name}
            </h2>
            <p className="text-warm-2 mb-6 text-sm leading-relaxed">
              {STORE_INFO.description}
            </p>
            <div className="space-y-3">
              <a
                href={STORE_INFO.address.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sand-6 flex items-start gap-2 text-sm transition-colors"
              >
                <MapPin className="text-sand-6 mt-0.5 h-4 w-4 flex-shrink-0" />
                <span className="text-sm">
                  {STORE_INFO.address.line1}
                  <br />
                  {STORE_INFO.address.line2}
                </span>
              </a>
              <div className="flex items-center gap-2">
                <Phone className="text-sand-6 h-4 w-4" />
                <span className="text-sm">{STORE_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="text-sand-6 h-4 w-4" />
                <span className="text-sm">{STORE_INFO.email}</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Categories
            </h3>
            <ul className="space-y-2">
              {displayCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-warm-2 hover:text-sand-6 text-sm transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-warm-2 hover:text-sand-6 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Customer Service
            </h3>
            <ul className="space-y-2">
              {customerService.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-warm-2 hover:text-sand-6 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-10 bg-white/10" />

        {/* Bottom Footer */}
        <div className="text-warm-2 flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {STORE_INFO.name}. All rights
            reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <Link
              href="https://facebook.com"
              target="_blank"
              className="hover:text-sand-6 transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              className="hover:text-sand-6 transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </Link>
            <Link
              href="https://x.com"
              target="_blank"
              className="hover:text-sand-6 transition-colors"
              aria-label="X (Twitter)"
            >
              <XIcon />
            </Link>
            <Link
              href="https://youtube.com"
              target="_blank"
              className="hover:text-sand-6 transition-colors"
              aria-label="YouTube"
            >
              <YoutubeIcon />
            </Link>
          </div>

          {/* Payment Methods */}
          {paymentMethods.length > 0 && (
            <div className="text-warm-3 flex flex-wrap items-center justify-center gap-2 text-xs tracking-[0.2em] uppercase md:justify-end">
              <span>We Accept:</span>
              {paymentMethods.map((method, index) => (
                <span key={method} className="flex items-center">
                  {index > 0 && <span className="mr-2">|</span>}
                  <span className="font-semibold">{method}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
