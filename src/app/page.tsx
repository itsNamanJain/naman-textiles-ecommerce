import {
  HeroBanner,
  CategoryGrid,
  FeaturedProducts,
  FeaturesSection,
  PromoBanner,
} from "@/components/home";

export default function HomePage() {
  return (
    <>
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
