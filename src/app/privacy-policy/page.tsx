import Link from "next/link";
import { ChevronRight, Home, AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { STORE_INFO } from "@/lib/constants";

export default function PrivacyPolicyPage() {
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
            <span className="text-ink-1 font-medium">Privacy Policy</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="animate-fade-in-up text-center">
            <h1 className="font-display text-ink-1 text-3xl md:text-4xl">
              Privacy Policy
            </h1>
            <p className="text-muted-1 mt-3 text-base md:text-lg">
              How we collect, use, and protect your personal information.
            </p>
          </div>

          {/* Policy Content */}
          <Card className="animate-fade-in-up animation-delay-100 mt-10 border border-black/5 bg-white/80">
            <CardContent className="prose-policy p-8 md:p-10">
              <section>
                <h2>Introduction</h2>
                <p>
                  {STORE_INFO.name} (&quot;we&quot;, &quot;our&quot;, or
                  &quot;us&quot;) is committed to protecting the privacy of our
                  customers. This Privacy Policy explains how we collect, use,
                  and safeguard your information when you visit our website or
                  make a purchase.
                </p>
              </section>

              <section>
                <h2>Information We Collect</h2>
                <p>
                  We collect information that you provide directly to us when
                  you:
                </p>
                <ul>
                  <li>Create an account or place an order.</li>
                  <li>
                    Provide your name, email address, phone number, and shipping
                    address.
                  </li>
                  <li>Contact us via WhatsApp, email, or phone.</li>
                  <li>Subscribe to updates or notifications.</li>
                </ul>
                <p>We may also automatically collect:</p>
                <ul>
                  <li>
                    Device and browser information (browser type, operating
                    system).
                  </li>
                  <li>
                    Usage data (pages visited, time spent, referral source).
                  </li>
                  <li>
                    Cookies and similar technologies for site functionality.
                  </li>
                </ul>
              </section>

              <section>
                <h2>How We Use Your Information</h2>
                <p>We use your personal information to:</p>
                <ul>
                  <li>Process and fulfill your orders.</li>
                  <li>
                    Send order confirmations, shipping updates, and delivery
                    notifications.
                  </li>
                  <li>
                    Respond to your queries and provide customer support.
                  </li>
                  <li>
                    Improve our website, products, and services.
                  </li>
                  <li>
                    Prevent fraud and maintain the security of our platform.
                  </li>
                </ul>
              </section>

              <section>
                <h2>Information Sharing</h2>
                <p>
                  We do not sell, trade, or rent your personal information to
                  third parties. We may share your information only with:
                </p>
                <ul>
                  <li>
                    <strong>Shipping partners</strong> &mdash; to deliver your
                    orders (name, address, and phone number).
                  </li>
                  <li>
                    <strong>Payment processors</strong> &mdash; to securely
                    process your payments. We do not store your payment card
                    details.
                  </li>
                  <li>
                    <strong>Legal authorities</strong> &mdash; if required by law
                    or to protect our rights.
                  </li>
                </ul>
              </section>

              <section>
                <h2>Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your
                  personal information, including:
                </p>
                <ul>
                  <li>Encrypted data transmission (SSL/TLS).</li>
                  <li>Secure password hashing for user accounts.</li>
                  <li>
                    Restricted access to personal data on a need-to-know basis.
                  </li>
                </ul>
                <p>
                  While we strive to protect your data, no method of
                  transmission over the internet is 100% secure. We encourage you
                  to use strong passwords and keep your account credentials
                  safe.
                </p>
              </section>

              <section>
                <h2>Cookies</h2>
                <p>
                  Our website uses cookies to enhance your browsing experience.
                  Cookies help us:
                </p>
                <ul>
                  <li>Remember your cart items and preferences.</li>
                  <li>Keep you signed in to your account.</li>
                  <li>Understand how visitors use our website.</li>
                </ul>
                <p>
                  You can disable cookies in your browser settings, but some
                  features of our website may not function properly without them.
                </p>
              </section>

              <section>
                <h2>Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                  <li>
                    Access and review the personal information we hold about you.
                  </li>
                  <li>
                    Request correction of inaccurate or incomplete data.
                  </li>
                  <li>
                    Request deletion of your account and associated data.
                  </li>
                  <li>Opt out of marketing communications at any time.</li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us using the
                  details below.
                </p>
              </section>

              <section>
                <h2>Third-Party Links</h2>
                <p>
                  Our website may contain links to third-party websites. We are
                  not responsible for the privacy practices of these external
                  sites. We encourage you to read their privacy policies before
                  sharing any personal information.
                </p>
              </section>

              <section>
                <h2>Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. Any
                  changes will be posted on this page. We encourage you to review
                  this page periodically.
                </p>
              </section>

              <div className="bg-paper-1 mt-8 flex items-start gap-3 rounded-2xl p-4">
                <AlertCircle className="text-brand-1 mt-0.5 h-5 w-5 flex-shrink-0" />
                <p className="text-muted-1 text-sm">
                  If you have any questions about this Privacy Policy, contact us
                  at <strong>{STORE_INFO.email}</strong> or call{" "}
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
