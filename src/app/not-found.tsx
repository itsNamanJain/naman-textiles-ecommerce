import Link from "next/link";
import { Home, Search, ShoppingBag, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center bg-transparent px-4">
      {/* Decorative fabric pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="bg-brand-1 absolute top-0 -left-4 h-72 w-72 rounded-full blur-3xl" />
        <div className="bg-sand-1 absolute -right-4 bottom-0 h-72 w-72 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-paper-3 text-[150px] leading-none font-semibold sm:text-[200px]">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-paper-1 rounded-full p-6">
              <ShoppingBag className="text-brand-1 h-16 w-16 sm:h-20 sm:w-20" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mt-4">
          <h2 className="font-display text-ink-1 text-2xl sm:text-3xl">
            Page Not Found
          </h2>
          <p className="text-muted-1 mx-auto mt-3 max-w-md">
            Oops! The page you&apos;re looking for seems to have unraveled. It
            might have been moved, deleted, or perhaps never existed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="bg-brand-1 hover:bg-brand-2 w-full rounded-full sm:w-auto"
            asChild
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Go to Homepage
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-ink-1 w-full rounded-full border-black/10 bg-white/80 hover:bg-white sm:w-auto"
            asChild
          >
            <Link href="/products">
              <Search className="mr-2 h-5 w-5" />
              Browse Products
            </Link>
          </Button>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="javascript:history.back()"
            className="text-muted-1 hover:text-brand-1 inline-flex items-center text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back to previous page
          </Link>
        </div>

        {/* Popular Links */}
        <div className="mt-12 rounded-2xl border border-black/5 bg-white/80 p-6 shadow-[0_20px_50px_rgba(15,15,15,0.08)]">
          <h3 className="text-ink-1 text-sm font-medium">Popular Categories</h3>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              { name: "Cotton Fabrics", slug: "cotton-fabrics" },
              { name: "Silk Fabrics", slug: "silk-fabrics" },
              { name: "Linen Fabrics", slug: "linen-fabrics" },
              { name: "Printed Fabrics", slug: "printed-fabrics" },
              { name: "Suit Pieces", slug: "suit-pieces" },
            ].map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="text-muted-1 hover:border-brand-1 hover:bg-paper-1 hover:text-brand-3 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <p className="text-muted-2 mt-8 text-sm">
          Need help? Contact us at{" "}
          <a
            href="mailto:support@namantextiles.com"
            className="text-brand-1 hover:underline"
          >
            support@namantextiles.com
          </a>
        </p>
      </div>
    </div>
  );
}
