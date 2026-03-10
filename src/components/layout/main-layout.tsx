"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import { WhatsAppButton } from "./whatsapp-button";
import { CartDrawer } from "@/components/cart";
import { AnimatePresence, motion } from "@/components/ui/motion";

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
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            className="flex-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
        <Footer />
      </div>
      <CartDrawer />
      <WhatsAppButton />
    </>
  );
}
