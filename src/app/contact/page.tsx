"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Home,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STORE_INFO } from "@/lib/constants";

// Format WhatsApp number for link (remove + and spaces)
const whatsappNumber = STORE_INFO.whatsapp.replace(/[+\s]/g, "");

// Get working days (all days except closed day)
const getWorkingDays = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const closedIndex = days.findIndex(
    (d) => d.toLowerCase() === STORE_INFO.businessHours.closedDay.toLowerCase()
  );
  if (closedIndex === -1) return "All Days";

  // Simple format: if Monday is closed, show "Tue - Sun"
  const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const workingDays = shortDays.filter((_, i) => i !== closedIndex);
  return `${workingDays[0]} - ${workingDays[workingDays.length - 1]}`;
};

export default function ContactPage() {
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
            <span className="text-ink-1 font-medium">Contact Us</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="animate-fade-in-up text-center">
            <h1 className="font-display text-ink-1 text-3xl md:text-4xl">
              Get in Touch
            </h1>
            <p className="text-muted-1 mt-3 text-base md:text-lg">
              We&apos;d love to hear from you. Reach out to us for any queries.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Contact Info Cards */}
            <div className="animate-fade-in-up animation-delay-100 space-y-4">
              <Card className="card-hover border border-black/5 bg-white/80">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="bg-paper-1 rounded-2xl p-3">
                    <MapPin className="text-brand-1 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-ink-1 font-semibold">Visit Us</h3>
                    <p className="text-muted-1 mt-1 text-sm">
                      {STORE_INFO.address.line1}
                      <br />
                      {STORE_INFO.address.line2}
                      <br />
                      {STORE_INFO.address.country}
                    </p>
                    <a
                      href={STORE_INFO.address.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-1 hover:text-brand-2 mt-2 inline-block text-sm"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover border border-black/5 bg-white/80">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="bg-paper-1 rounded-2xl p-3">
                    <Phone className="text-brand-1 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-ink-1 font-semibold">Call Us</h3>
                    <p className="text-muted-1 mt-1 text-sm">
                      {STORE_INFO.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover border border-black/5 bg-white/80">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="bg-paper-1 rounded-2xl p-3">
                    <Mail className="text-brand-1 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-ink-1 font-semibold">Email Us</h3>
                    <p className="text-muted-1 mt-1 text-sm">
                      {STORE_INFO.email}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover border border-black/5 bg-white/80">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="bg-paper-1 rounded-2xl p-3">
                    <Clock className="text-brand-1 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-ink-1 font-semibold">Business Hours</h3>
                    <p className="text-muted-1 mt-1 text-sm">
                      {getWorkingDays()}: {STORE_INFO.businessHours.open}
                      <br />
                      <span className="text-danger-1">
                        {STORE_INFO.businessHours.closedDay}: Closed
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Google Map */}
            <div className="animate-fade-in-up animation-delay-200">
              <Card className="overflow-hidden border border-black/5 bg-white/80">
                <CardContent className="p-0">
                  <div className="relative h-72 w-full">
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
                  <div className="flex flex-col gap-2 border-t border-black/5 bg-white/80 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-1 text-sm">
                      {STORE_INFO.address.line1}, {STORE_INFO.address.city}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-ink-1 w-full rounded-full border-black/10 bg-white/80 hover:bg-white sm:w-auto"
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="animate-fade-in-up animation-delay-300 from-ink-1 via-muted-6 to-brand-1 mt-12 rounded-3xl bg-gradient-to-r p-8 text-center text-white shadow-[0_30px_70px_rgba(45,28,18,0.35)]">
            <h2 className="font-display text-2xl">
              Quick Support via WhatsApp
            </h2>
            <p className="mt-2 text-sm text-white/80 md:text-base">
              Get instant responses to your queries
            </p>
            <Button
              className="text-ink-1 mt-6 rounded-full bg-white hover:bg-white/90"
              size="lg"
              asChild
            >
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
