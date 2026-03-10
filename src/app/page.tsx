import type { Metadata } from "next";
import Script from "next/script";
import {
  HeroBanner,
  CategoryGrid,
  FeaturedProducts,
  FeaturesSection,
  PromoBanner,
} from "@/components/home";

export const metadata: Metadata = {
  title: {
    absolute:
      "Naman Textiles - Premium Fabrics from Delhi | Shop Cotton, Rayon, Brocade Online",
  },
  description:
    "Shop premium quality fabrics online at Naman Textiles, Delhi. Cotton, Rayon, Banarsi Brocade, Velvet, Silk, and more. Wholesale and retail. Pan-India delivery.",
  openGraph: {
    title: "Naman Textiles - Premium Fabrics from Delhi",
    description:
      "Shop premium quality fabrics online. Cotton, Rayon, Banarsi Brocade, Velvet, and more. Since 1990.",
    url: "https://namantextiles.com",
  },
};

export default function HomePage() {
  return (
    <>
      <Script
        id="structured-data-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ClothingStore",
            name: "Naman Textiles",
            description:
              "Premium quality fabrics — Cotton, Rayon, Banarsi Brocade, Velvet, and more. Since 1990.",
            url: "https://namantextiles.com",
            telephone: "+91-87429-09296",
            email: "contact@namantextiles.com",
            address: {
              "@type": "PostalAddress",
              streetAddress: "9/5152, Main Road, Shanti Mohalla",
              addressLocality: "Gandhi Nagar, Delhi",
              addressRegion: "Delhi",
              postalCode: "110031",
              addressCountry: "IN",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: "28.6692",
              longitude: "77.2741",
            },
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],
              opens: "10:00",
              closes: "20:00",
            },
            sameAs: [
              "https://www.facebook.com/Namostu.textiles/",
              "https://www.instagram.com/naman.textiles/",
              "https://www.youtube.com/@Namantextiles",
            ],
            foundingDate: "1990",
          }),
        }}
      />

      {/* Hero Banner Carousel */}
      <HeroBanner />

      {/* Features Strip */}
      <FeaturesSection />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Promotional Banners */}
      <PromoBanner />

      {/* New Arrivals Section */}
      <FeaturedProducts
        title="New Arrivals"
        subtitle="Fresh fabrics just added to our collection"
      />
    </>
  );
}
