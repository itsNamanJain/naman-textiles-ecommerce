import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  MapPin,
  Clock,
  Phone,
  Scissors,
  Store,
  Users,
  Truck,
  Award,
  Heart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Naman Textiles — a trusted fabric shop in Seelampur, Delhi since 1990. Wholesale and retail Cotton, Rayon, Banarsi Brocade, Velvet, and more.",
  openGraph: {
    title: "About Naman Textiles - Premium Fabrics Since 1990",
    description:
      "Trusted fabric shop in Seelampur, Delhi offering wholesale and retail textiles since 1990.",
  },
};

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { STORE_INFO } from "@/lib/constants";

const highlights = [
  {
    icon: Store,
    title: "Established Since 1990",
    description:
      "Over three decades of trusted service in the heart of Delhi's textile market.",
  },
  {
    icon: Scissors,
    title: "Wide Fabric Range",
    description:
      "From everyday Cotton to luxurious Banarsi Brocade, we stock fabrics for every need.",
  },
  {
    icon: Users,
    title: "Wholesale & Retail",
    description:
      "Whether you need a few meters or bulk rolls, we cater to tailors, designers, and families alike.",
  },
  {
    icon: Truck,
    title: "Pan-India Delivery",
    description:
      "Order from anywhere in India and get your fabrics delivered right to your doorstep.",
  },
];

const fabricCategories = [
  "Cotton & Cotton Blends",
  "Silk & Art Silk",
  "Banarsi Brocade",
  "Georgette & Chiffon",
  "Rayon & Viscose",
  "Linen",
  "Polyester & Blends",
  "Embroidered Fabrics",
];

export default function AboutPage() {
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
            <span className="text-ink-1 font-medium">About Us</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="animate-fade-in-up text-center">
            <h1 className="font-display text-ink-1 text-3xl md:text-4xl">
              About {STORE_INFO.name}
            </h1>
            <p className="text-muted-1 mx-auto mt-3 max-w-2xl text-base md:text-lg">
              Your trusted destination for premium quality fabrics in the heart
              of Delhi&apos;s historic Shanti Mohalla textile market.
            </p>
          </div>

          {/* Our Story */}
          <Card className="animate-fade-in-up animation-delay-100 mt-12 border border-black/5 bg-white/80">
            <CardContent className="p-8 md:p-10">
              <h2 className="font-display text-ink-1 text-2xl">Our Story</h2>
              <div className="text-muted-1 mt-4 space-y-4 text-sm leading-relaxed md:text-base">
                <p>
                  Founded in 1990, {STORE_INFO.name} has grown from a small
                  fabric shop in Shanti Mohalla to one of the most trusted names
                  in Delhi&apos;s wholesale textile market. Located in the
                  bustling lanes of Seelampur &mdash; home to over 2,000 fabric
                  shops &mdash; we have served generations of customers with
                  quality fabrics at honest prices.
                </p>
                <p>
                  What started as a passion for textiles has evolved into a
                  business built on trust, quality, and deep knowledge of
                  fabrics. From local tailors and boutique designers to families
                  shopping for special occasions, our doors are open to everyone.
                </p>
                <p>
                  Now, with our online store, we bring the same curated
                  collection and personal service to customers across India.
                  Every fabric you see on our website is hand-picked and
                  quality-checked before it reaches you.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Highlights Grid */}
          <div className="animate-fade-in-up animation-delay-200 mt-8 grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <Card
                key={item.title}
                className="card-hover border border-black/5 bg-white/80"
              >
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="bg-paper-1 rounded-2xl p-3">
                    <item.icon className="text-brand-1 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-ink-1 font-semibold">{item.title}</h3>
                    <p className="text-muted-1 mt-1 text-sm">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* What We Offer */}
          <div className="animate-fade-in-up animation-delay-300 mt-8 grid gap-8 lg:grid-cols-2">
            <Card className="border border-black/5 bg-white/80">
              <CardContent className="p-8">
                <div className="flex items-center gap-3">
                  <div className="bg-paper-1 rounded-2xl p-3">
                    <Heart className="text-brand-1 h-6 w-6" />
                  </div>
                  <h2 className="font-display text-ink-1 text-xl">
                    What We Offer
                  </h2>
                </div>
                <ul className="text-muted-1 mt-5 space-y-2.5 text-sm">
                  {fabricCategories.map((category) => (
                    <li key={category} className="flex items-center gap-2">
                      <span className="bg-brand-1 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                      {category}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-black/5 bg-white/80">
              <CardContent className="p-8">
                <div className="flex items-center gap-3">
                  <div className="bg-paper-1 rounded-2xl p-3">
                    <Award className="text-brand-1 h-6 w-6" />
                  </div>
                  <h2 className="font-display text-ink-1 text-xl">
                    Why Choose Us
                  </h2>
                </div>
                <ul className="text-muted-1 mt-5 space-y-2.5 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="bg-brand-1 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                    Direct sourcing from mills ensures competitive wholesale
                    prices
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-brand-1 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                    Every piece is quality-checked before dispatch
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-brand-1 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                    Custom cutting available &mdash; order by the meter or full
                    roll
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-brand-1 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                    Bulk order discounts for tailors, designers, and businesses
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-brand-1 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                    Easy returns and responsive customer support via WhatsApp
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-brand-1 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                    GST invoicing available for B2B orders
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Visit Us */}
          <Card className="animate-fade-in-up animation-delay-400 mt-8 overflow-hidden border border-black/5 bg-white/80">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-2">
                <div className="p-8">
                  <h2 className="font-display text-ink-1 text-2xl">
                    Visit Our Store
                  </h2>
                  <p className="text-muted-1 mt-3 text-sm leading-relaxed">
                    Nothing beats seeing and feeling fabrics in person. Visit us
                    at our shop in Shanti Mohalla and explore our full
                    collection.
                  </p>

                  <Separator className="my-6 bg-black/5" />

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-brand-1 mt-0.5 h-5 w-5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-ink-1 font-medium">Address</p>
                        <p className="text-muted-1 mt-0.5">
                          {STORE_INFO.address.line1}
                          <br />
                          {STORE_INFO.address.line2}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="text-brand-1 mt-0.5 h-5 w-5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-ink-1 font-medium">Business Hours</p>
                        <p className="text-muted-1 mt-0.5">
                          {STORE_INFO.businessHours.open}
                          <br />
                          <span className="text-danger-1">
                            Closed on {STORE_INFO.businessHours.closedDay}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="text-brand-1 mt-0.5 h-5 w-5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-ink-1 font-medium">Phone</p>
                        <p className="text-muted-1 mt-0.5">{STORE_INFO.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      className="bg-brand-1 hover:bg-brand-2 rounded-full"
                      asChild
                    >
                      <a
                        href={STORE_INFO.address.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Get Directions
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="text-ink-1 rounded-full border-black/10"
                      asChild
                    >
                      <Link href="/contact">Contact Us</Link>
                    </Button>
                  </div>
                </div>

                {/* Map */}
                <div className="relative min-h-[300px]">
                  <iframe
                    src={STORE_INFO.address.googleMapsEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${STORE_INFO.name} Location`}
                    className="absolute inset-0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
