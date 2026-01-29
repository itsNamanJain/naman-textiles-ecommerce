import "@/styles/globals.css";

import { type Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/providers";
import { MainLayout } from "@/components/layout";

export const metadata: Metadata = {
  title: {
    default: "Naman Textiles - Premium Fabrics from Delhi",
    template: "%s | Naman Textiles",
  },
  description:
    "Shop premium quality fabrics at Naman Textiles. We offer Cotton, Rayon, Banarsi Brocade, Velvet Work, and more. Located in Gandhi Nagar, Delhi.",
  keywords: [
    "fabrics",
    "textiles",
    "cotton",
    "rayon",
    "brocade",
    "velvet",
    "gandhi nagar",
    "delhi",
    "wholesale fabrics",
  ],
  authors: [{ name: "Naman Textiles" }],
  creator: "Naman Textiles",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://namantextiles.com",
    siteName: "Naman Textiles",
    title: "Naman Textiles - Premium Fabrics from Delhi",
    description:
      "Shop premium quality fabrics at Naman Textiles. Cotton, Rayon, Banarsi Brocade, Velvet Work, and more.",
  },
};

const displayFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="font-body min-h-screen bg-white antialiased">
        <SessionProvider>
          <TRPCReactProvider>
            <MainLayout>{children}</MainLayout>
            <Toaster />
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
