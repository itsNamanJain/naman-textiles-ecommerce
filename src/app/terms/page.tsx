import Link from "next/link";
import { ChevronRight, Home, AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { STORE_INFO } from "@/lib/constants";

export default function TermsPage() {
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
              Terms &amp; Conditions
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="animate-fade-in-up text-center">
            <h1 className="font-display text-ink-1 text-3xl md:text-4xl">
              Terms &amp; Conditions
            </h1>
            <p className="text-muted-1 mt-3 text-base md:text-lg">
              Please read these terms carefully before using our website or
              placing an order.
            </p>
          </div>

          {/* Content */}
          <Card className="animate-fade-in-up animation-delay-100 mt-10 border border-black/5 bg-white/80">
            <CardContent className="prose-policy p-8 md:p-10">
              <section>
                <h2>General</h2>
                <p>
                  These Terms &amp; Conditions govern your use of the{" "}
                  {STORE_INFO.name} website and any purchases made through it. By
                  accessing our website or placing an order, you agree to be
                  bound by these terms.
                </p>
              </section>

              <section>
                <h2>Products &amp; Pricing</h2>
                <ul>
                  <li>
                    All product images are for representation purposes. Actual
                    fabric colors and textures may vary slightly due to monitor
                    settings and photography.
                  </li>
                  <li>
                    Prices are listed in Indian Rupees (INR) and include
                    applicable GST unless stated otherwise.
                  </li>
                  <li>
                    We reserve the right to modify prices at any time without
                    prior notice. Price changes will not affect orders already
                    confirmed.
                  </li>
                  <li>
                    Product availability is subject to stock. If an ordered item
                    is out of stock, we will notify you and offer a refund or
                    alternative.
                  </li>
                </ul>
              </section>

              <section>
                <h2>Orders &amp; Payment</h2>
                <ul>
                  <li>
                    An order is confirmed only after successful payment. We
                    reserve the right to cancel any order due to stock
                    unavailability or pricing errors.
                  </li>
                  <li>
                    Fabric sold by the meter is cut as per your specified length.
                    Cut-to-order fabric cannot be returned or exchanged unless
                    defective.
                  </li>
                  <li>
                    We accept payments via UPI, debit/credit cards, and net
                    banking through our secure payment gateway.
                  </li>
                  <li>
                    GST invoices are provided for all orders. If you require a
                    B2B invoice with your GSTIN, please provide it during
                    checkout.
                  </li>
                </ul>
              </section>

              <section>
                <h2>Shipping &amp; Delivery</h2>
                <p>
                  Shipping terms, delivery timelines, and charges are detailed in
                  our{" "}
                  <Link
                    href="/shipping-policy"
                    className="text-brand-1 hover:text-brand-2"
                  >
                    Shipping Policy
                  </Link>
                  . By placing an order, you agree to the shipping terms outlined
                  therein.
                </p>
              </section>

              <section>
                <h2>Returns &amp; Refunds</h2>
                <p>
                  Our return and refund terms are detailed in our{" "}
                  <Link
                    href="/return-policy"
                    className="text-brand-1 hover:text-brand-2"
                  >
                    Return &amp; Refund Policy
                  </Link>
                  . By placing an order, you agree to the return terms outlined
                  therein.
                </p>
              </section>

              <section>
                <h2>User Accounts</h2>
                <ul>
                  <li>
                    You are responsible for maintaining the confidentiality of
                    your account credentials.
                  </li>
                  <li>
                    You agree to provide accurate, current, and complete
                    information during registration and checkout.
                  </li>
                  <li>
                    We reserve the right to suspend or terminate accounts that
                    violate these terms or are used for fraudulent activity.
                  </li>
                </ul>
              </section>

              <section>
                <h2>Intellectual Property</h2>
                <p>
                  All content on this website &mdash; including product images,
                  text, logos, and design &mdash; is the property of{" "}
                  {STORE_INFO.name} and may not be reproduced, distributed, or
                  used without our prior written consent.
                </p>
              </section>

              <section>
                <h2>Limitation of Liability</h2>
                <ul>
                  <li>
                    {STORE_INFO.name} shall not be liable for any indirect,
                    incidental, or consequential damages arising from the use of
                    our website or products.
                  </li>
                  <li>
                    Our total liability for any claim shall not exceed the amount
                    paid by you for the specific order in question.
                  </li>
                </ul>
              </section>

              <section>
                <h2>Privacy</h2>
                <p>
                  Your use of our website is also governed by our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-brand-1 hover:text-brand-2"
                  >
                    Privacy Policy
                  </Link>
                  , which explains how we collect and use your personal data.
                </p>
              </section>

              <section>
                <h2>Changes to These Terms</h2>
                <p>
                  We may update these Terms &amp; Conditions from time to time.
                  Changes will be posted on this page. Continued use of the
                  website after changes constitutes acceptance of the updated
                  terms.
                </p>
              </section>

              <div className="bg-paper-1 mt-8 flex items-start gap-3 rounded-2xl p-4">
                <AlertCircle className="text-brand-1 mt-0.5 h-5 w-5 flex-shrink-0" />
                <p className="text-muted-1 text-sm">
                  If you have any questions about these terms, contact us at{" "}
                  <strong>{STORE_INFO.email}</strong> or call{" "}
                  <strong>{STORE_INFO.phone}</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
