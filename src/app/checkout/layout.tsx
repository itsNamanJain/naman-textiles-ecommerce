import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your Naman Textiles order. Enter shipping details and place your fabric order securely.",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
