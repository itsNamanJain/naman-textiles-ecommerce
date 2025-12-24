"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import { CartDrawer } from "@/components/cart";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  // Don't show header/footer on admin pages
  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <CartDrawer />
    </>
  );
}
