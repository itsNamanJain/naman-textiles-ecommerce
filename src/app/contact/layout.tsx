import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Naman Textiles. Visit us at Shanti Mohalla, Seelampur, Delhi or reach us via phone, email, or WhatsApp. Open 10 AM - 8 PM, closed Monday.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
