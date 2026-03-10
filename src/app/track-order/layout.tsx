import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order",
  description:
    "Track your Naman Textiles order status. Enter your order number to check delivery status and shipping updates.",
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
