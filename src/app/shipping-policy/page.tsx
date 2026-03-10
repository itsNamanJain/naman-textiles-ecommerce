import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  Truck,
  Package,
  Clock,
  MapPin,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { STORE_INFO, DEFAULT_SETTINGS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Naman Textiles shipping policy. Learn about delivery timelines, shipping charges, order tracking, and pan-India delivery for fabric orders.",
};

const shippingHighlights = [
  {
    icon: Truck,
    title: "Pan-India Delivery",
    description: "We deliver to all serviceable pin codes across India.",
  },
  {
    icon: Package,
    title: `Flat ${formatPrice(DEFAULT_SETTINGS.shippingBaseRate)} Shipping`,
    description:
      "Standard flat-rate shipping on all orders, regardless of weight.",
  },
  {
    icon: Clock,
    title: "5\u20137 Business Days",
    description:
      "Orders are typically delivered within 5\u20137 business days after dispatch.",
  },
  {
    icon: MapPin,
    title: "Order Tracking",
    description:
      "Track your order in real-time from dispatch to delivery on our website.",
  },
];

export default function ShippingPolicyPage() {
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
            <span className="text-ink-1 font-medium">Shipping Policy</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="animate-fade-in-up text-center">
            <h1 className="font-display text-ink-1 text-3xl md:text-4xl">
              Shipping Policy
            </h1>
            <p className="text-muted-1 mt-3 text-base md:text-lg">
              Everything you need to know about how we deliver your fabrics.
            </p>
          </div>

          {/* Highlights */}
          <div className="animate-fade-in-up animation-delay-100 mt-10 grid gap-4 sm:grid-cols-2">
            {shippingHighlights.map((item) => (
              <Card
                key={item.title}
                className="border border-black/5 bg-white/80"
              >
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="bg-paper-1 rounded-2xl p-3">
                    <item.icon className="text-brand-1 h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-ink-1 text-sm font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-muted-1 mt-1 text-xs">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Policy Content */}
          <Card className="animate-fade-in-up animation-delay-200 mt-8 border border-black/5 bg-white/80">
            <CardContent className="prose-policy p-8 md:p-10">
              <section>
                <h2>Order Processing</h2>
                <ul>
                  <li>
                    Orders are processed within 1&ndash;2 business days after
                    payment confirmation.
                  </li>
                  <li>
                    Orders placed on Sundays or public holidays will be processed
                    on the next business day.
                  </li>
                  <li>
                    You will receive a confirmation email/WhatsApp message once
                    your order has been dispatched along with the tracking
                    details.
                  </li>
                </ul>
              </section>

              <section>
                <h2>Shipping Charges</h2>
                <ul>
                  <li>
                    A flat shipping fee of{" "}
                    <strong>
                      {formatPrice(DEFAULT_SETTINGS.shippingBaseRate)}
                    </strong>{" "}
                    is applicable on all orders.
                  </li>
                  <li>
                    Minimum order value is{" "}
                    <strong>
                      {formatPrice(DEFAULT_SETTINGS.orderMinAmount)}
                    </strong>
                    .
                  </li>
                </ul>
              </section>

              <section>
                <h2>Delivery Timeline</h2>
                <ul>
                  <li>
                    <strong>Metro cities</strong> (Delhi NCR, Mumbai, Bangalore,
                    etc.): 3&ndash;5 business days.
                  </li>
                  <li>
                    <strong>Other cities &amp; towns</strong>: 5&ndash;7 business
                    days.
                  </li>
                  <li>
                    <strong>Remote areas</strong>: 7&ndash;10 business days.
                  </li>
                  <li>
                    Delivery timelines are estimates and may vary due to
                    unforeseen circumstances such as weather, courier delays, or
                    public holidays.
                  </li>
                </ul>
              </section>

              <section>
                <h2>Order Tracking</h2>
                <p>
                  Once your order is shipped, you will receive a tracking number
                  via email or WhatsApp. You can track your order on our{" "}
                  <Link
                    href="/track-order"
                    className="text-brand-1 hover:text-brand-2"
                  >
                    Track Order
                  </Link>{" "}
                  page or directly on the courier partner&apos;s website.
                </p>
              </section>

              <section>
                <h2>Shipping Partners</h2>
                <p>
                  We work with reputed courier partners to ensure safe and timely
                  delivery of your orders. The courier partner is assigned based
                  on your delivery location for the best possible service.
                </p>
              </section>

              <section>
                <h2>Damaged or Lost Shipments</h2>
                <ul>
                  <li>
                    If your package arrives damaged, please take photos of the
                    packaging and product, and contact us within 24 hours of
                    delivery.
                  </li>
                  <li>
                    For lost shipments, please contact us and we will coordinate
                    with the courier partner to resolve the issue.
                  </li>
                </ul>
              </section>

              <div className="bg-paper-1 mt-8 flex items-start gap-3 rounded-2xl p-4">
                <AlertCircle className="text-brand-1 mt-0.5 h-5 w-5 flex-shrink-0" />
                <p className="text-muted-1 text-sm">
                  For any shipping-related queries, reach out to us at{" "}
                  <strong>{STORE_INFO.phone}</strong> or email{" "}
                  <strong>{STORE_INFO.email}</strong>. We&apos;re happy to help!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
