import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description:
    "Review items in your Naman Textiles shopping cart. View fabric selections, adjust quantities, and proceed to checkout.",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
