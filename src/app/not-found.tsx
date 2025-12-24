import Link from "next/link";
import { Home, Search, ShoppingBag, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center bg-gray-50 px-4">
      {/* Decorative fabric pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-amber-500 blur-3xl" />
        <div className="absolute -right-4 bottom-0 h-72 w-72 rounded-full bg-amber-600 blur-3xl" />
      </div>

      <div className="relative text-center">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-[150px] font-bold leading-none text-gray-200 sm:text-[200px]">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-amber-100 p-6">
              <ShoppingBag className="h-16 w-16 text-amber-600 sm:h-20 sm:w-20" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Page Not Found
          </h2>
          <p className="mx-auto mt-3 max-w-md text-gray-500">
            Oops! The page you&apos;re looking for seems to have unraveled. 
            It might have been moved, deleted, or perhaps never existed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="w-full bg-amber-600 hover:bg-amber-700 sm:w-auto"
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
            className="w-full sm:w-auto"
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
            className="inline-flex items-center text-sm text-gray-500 hover:text-amber-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back to previous page
          </Link>
        </div>

        {/* Popular Links */}
        <div className="mt-12 rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-900">
            Popular Categories
          </h3>
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
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-400">
          Need help? Contact us at{" "}
          <a
            href="mailto:support@namantextiles.com"
            className="text-amber-600 hover:underline"
          >
            support@namantextiles.com
          </a>
        </p>
      </div>
    </div>
  );
}
