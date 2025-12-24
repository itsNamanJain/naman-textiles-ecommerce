import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Home,
  ChevronRight,
  MessageCircle,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center text-gray-500 hover:text-amber-600"
            >
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">Contact Us</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="animate-fade-in-up text-center">
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Get in Touch
            </h1>
            <p className="mt-3 text-lg text-gray-500">
              We&apos;d love to hear from you. Reach out to us for any queries.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {/* Contact Info Cards */}
            <div className="animate-fade-in-up animation-delay-100 space-y-4">
              <Card className="card-hover">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="rounded-full bg-amber-100 p-3">
                    <MapPin className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Visit Us</h3>
                    <p className="mt-1 text-sm text-gray-500">
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
                      className="mt-2 inline-block text-sm text-amber-600 hover:text-amber-700"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="rounded-full bg-amber-100 p-3">
                    <Phone className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Call Us</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {STORE_INFO.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="rounded-full bg-amber-100 p-3">
                    <Mail className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Us</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {STORE_INFO.email}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="rounded-full bg-amber-100 p-3">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Business Hours
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {getWorkingDays()}: {STORE_INFO.businessHours.open}
                      <br />
                      <span className="text-red-500">
                        {STORE_INFO.businessHours.closedDay}: Closed
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="animate-fade-in-up animation-delay-200 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="+91 98765 43210" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="How can we help?" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <textarea
                        id="message"
                        rows={5}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 sm:w-auto">
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Google Map */}
              <Card className="mt-6 overflow-hidden">
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
                  <div className="flex flex-col gap-2 border-t bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-600">
                      {STORE_INFO.address.line1}, {STORE_INFO.address.city}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full sm:w-auto"
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
          <div className="animate-fade-in-up animation-delay-300 mt-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 p-8 text-center text-white">
            <h2 className="text-2xl font-bold">Quick Support via WhatsApp</h2>
            <p className="mt-2 text-green-100">
              Get instant responses to your queries
            </p>
            <Button
              className="mt-6 bg-white text-green-600 hover:bg-green-50"
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
