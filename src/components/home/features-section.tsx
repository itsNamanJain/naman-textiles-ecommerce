"use client";

import { Truck, Shield, Headphones, type LucideIcon } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { formatPrice } from "@/lib/utils";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export function FeaturesSection() {
  const shippingRate = Number(DEFAULT_SETTINGS.shippingBaseRate);

  const features: { icon: LucideIcon; title: string; description: string }[] = [
    {
      icon: Truck,
      title: "Flat Shipping",
      description: `Standard delivery fee of ${formatPrice(shippingRate)}`,
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "100% secure payment gateway",
    },
    {
      icon: Headphones,
      title: "Support",
      description: "Dedicated customer support",
    },
  ];

  return (
    <section className="border-y border-black/5 bg-white/80 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <StaggerContainer className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <div className="flex flex-col items-center text-center">
                <div className="bg-paper-1 mb-4 rounded-2xl p-4">
                  <feature.icon className="text-brand-1 h-6 w-6 md:h-7 md:w-7" />
                </div>
                <h3 className="text-ink-1 mb-1 font-semibold">
                  {feature.title}
                </h3>
                <p className="text-muted-1 text-xs md:text-sm">
                  {feature.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
