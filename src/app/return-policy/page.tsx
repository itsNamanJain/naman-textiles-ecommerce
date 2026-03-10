import Link from "next/link";
import {
  ChevronRight,
  Home,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { STORE_INFO } from "@/lib/constants";

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Breadcrumb */}
      <div className="border-b border-black/5 bg-white/70">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-muted-2 hover:text-brand-1 flex items-center"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="text-muted-3 h-4 w-4" />
            <span className="text-ink-1 font-medium">
              Return &amp; Refund Policy
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="animate-fade-in-up text-center">
            <h1 className="font-display text-ink-1 text-3xl md:text-4xl">
              Return &amp; Refund Policy
            </h1>
            <p className="text-muted-1 mt-3 text-base md:text-lg">
              We want you to be completely satisfied with your purchase.
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div className="animate-fade-in-up animation-delay-100 mt-10 grid gap-4 sm:grid-cols-3">
            <Card className="border border-black/5 bg-white/80">
              <CardContent className="flex flex-col items-center p-5 text-center">
                <div className="bg-paper-1 rounded-2xl p-3">
                  <RotateCcw className="text-brand-1 h-5 w-5" />
                </div>
                <h3 className="text-ink-1 mt-3 text-sm font-semibold">
                  7-Day Returns
                </h3>
                <p className="text-muted-1 mt-1 text-xs">
                  Return eligible items within 7 days of delivery.
                </p>
              </CardContent>
            </Card>
            <Card className="border border-black/5 bg-white/80">
              <CardContent className="flex flex-col items-center p-5 text-center">
                <div className="bg-paper-1 rounded-2xl p-3">
                  <CheckCircle className="text-brand-1 h-5 w-5" />
                </div>
                <h3 className="text-ink-1 mt-3 text-sm font-semibold">
                  Quality Guaranteed
                </h3>
                <p className="text-muted-1 mt-1 text-xs">
                  Get a replacement or refund for defective products.
                </p>
              </CardContent>
            </Card>
            <Card className="border border-black/5 bg-white/80">
              <CardContent className="flex flex-col items-center p-5 text-center">
                <div className="bg-paper-1 rounded-2xl p-3">
                  <XCircle className="text-brand-1 h-5 w-5" />
                </div>
                <h3 className="text-ink-1 mt-3 text-sm font-semibold">
                  Easy Cancellation
                </h3>
                <p className="text-muted-1 mt-1 text-xs">
                  Cancel unshipped orders for a full refund.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Policy Content */}
          <Card className="animate-fade-in-up animation-delay-200 mt-8 border border-black/5 bg-white/80">
            <CardContent className="prose-policy p-8 md:p-10">
              <section>
                <h2>Return Eligibility</h2>
                <p>
                  We accept returns under the following conditions:
                </p>
                <ul>
                  <li>
                    The product is defective, damaged during transit, or
                    significantly different from what was described on the
                    website.
                  </li>
                  <li>
                    The return request is raised within{" "}
                    <strong>7 days of delivery</strong>.
                  </li>
                  <li>
                    The fabric is unused, unwashed, unstitched, and in its
                    original packaging.
                  </li>
                </ul>
              </section>

              <section>
                <h2>Non-Returnable Items</h2>
                <p>
                  Due to the nature of textile products, the following are
                  not eligible for return:
                </p>
                <ul>
                  <li>
                    Cut fabric pieces (fabric that has been cut to your specified
                    length).
                  </li>
                  <li>Products that have been washed, altered, or stitched.</li>
                  <li>
                    Items marked as &quot;Non-Returnable&quot; or
                    &quot;Sale/Clearance&quot; on the product page.
                  </li>
                  <li>
                    Slight variations in color from what you see on screen
                    &mdash; monitor settings can cause minor differences, which
                    is not considered a defect.
                  </li>
                </ul>
              </section>

              <section>
                <h2>How to Request a Return</h2>
                <ol>
                  <li>
                    Contact us on WhatsApp at <strong>{STORE_INFO.phone}</strong>{" "}
                    or email <strong>{STORE_INFO.email}</strong> with your order
                    number.
                  </li>
                  <li>
                    Share clear photos of the product showing the defect or
                    issue.
                  </li>
                  <li>
                    Our team will review your request and respond within 24&ndash;48
                    hours.
                  </li>
                  <li>
                    If approved, we will arrange a reverse pickup or share return
                    shipping instructions.
                  </li>
                </ol>
              </section>

              <section>
                <h2>Refund Process</h2>
                <ul>
                  <li>
                    Refunds are initiated once the returned product is received
                    and inspected at our warehouse.
                  </li>
                  <li>
                    Refunds are processed within{" "}
                    <strong>5&ndash;7 business days</strong> to the original
                    payment method.
                  </li>
                  <li>
                    Shipping charges are non-refundable unless the return is due
                    to a defect or error on our part.
                  </li>
                </ul>
              </section>

              <section>
                <h2>Order Cancellation</h2>
                <ul>
                  <li>
                    Orders can be cancelled before they are shipped. You can
                    request cancellation from your{" "}
                    <Link
                      href="/account/orders"
                      className="text-brand-1 hover:text-brand-2"
                    >
                      order history
                    </Link>{" "}
                    page or by contacting us.
                  </li>
                  <li>
                    Once an order has been dispatched, it cannot be cancelled.
                    You may request a return after delivery instead.
                  </li>
                  <li>
                    Full refund will be issued for successfully cancelled orders
                    within 3&ndash;5 business days.
                  </li>
                </ul>
              </section>

              <section>
                <h2>Exchanges</h2>
                <p>
                  We currently do not offer direct exchanges. If you wish to
                  exchange a product, please initiate a return and place a new
                  order for the desired item.
                </p>
              </section>

              <div className="bg-paper-1 mt-8 flex items-start gap-3 rounded-2xl p-4">
                <AlertCircle className="text-brand-1 mt-0.5 h-5 w-5 flex-shrink-0" />
                <p className="text-muted-1 text-sm">
                  Have questions about a return?{" "}
                  <Link
                    href="/contact"
                    className="text-brand-1 hover:text-brand-2 font-medium"
                  >
                    Contact us
                  </Link>{" "}
                  and we&apos;ll help you out.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
