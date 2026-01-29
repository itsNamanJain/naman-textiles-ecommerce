import Link from "next/link";
import {
  ChevronRight,
  ClipboardList,
  Home,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STORE_INFO } from "@/lib/constants";

const whatsappNumber = STORE_INFO.whatsapp.replace(/[+\s]/g, "");

export default function BulkOrdersPage() {
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
            <span className="text-ink-1 font-medium">Bulk Orders</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="animate-fade-in-up text-center">
            <h1 className="font-display text-ink-1 text-3xl md:text-4xl">
              Bulk Orders &amp; Wholesale Quotes
            </h1>
            <p className="text-muted-1 mt-3 text-base md:text-lg">
              Planning a large order? Share your requirements and we&apos;ll
              send a customized quote.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* How it works */}
            <Card className="border border-black/5 bg-white/80">
              <CardHeader>
                <CardTitle className="text-ink-1 flex items-center gap-2 text-lg">
                  <ClipboardList className="text-brand-1 h-5 w-5" />
                  What to Include
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-1 space-y-3 text-sm">
                <p>
                  To speed up your quote, share these details when you contact
                  us:
                </p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Product names or category</li>
                  <li>Quantity and unit (meter/piece)</li>
                  <li>Delivery location and timeline</li>
                  <li>GST details (optional)</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact options */}
            <Card className="border border-black/5 bg-white/80">
              <CardHeader>
                <CardTitle className="text-ink-1 flex items-center gap-2 text-lg">
                  <Package className="text-brand-1 h-5 w-5" />
                  Get a Quote
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-1">
                  Reach our team directly and we&apos;ll respond quickly with
                  pricing and availability.
                </p>
                <div className="space-y-2">
                  <Button
                    className="bg-brand-1 hover:bg-brand-2 w-full rounded-full"
                    asChild
                  >
                    <a href={`mailto:${STORE_INFO.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Email for Quote
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-ink-1 w-full rounded-full border-black/10 bg-white/80 hover:bg-white"
                    asChild
                  >
                    <a href={`tel:${STORE_INFO.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Sales
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-ink-1 w-full rounded-full border-black/10 bg-white/80 hover:bg-white"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp Us
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-ink-1 w-full rounded-full"
                    asChild
                  >
                    <Link href="/contact">
                      <Truck className="mr-2 h-4 w-4" />
                      View Contact Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
