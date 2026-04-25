"use client";

import { usePathname } from "next/navigation";
import { FinalCtaBlock } from "@/components/final-cta-block";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppWidget } from "@/components/whatsapp-widget";

export function SiteTail() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const hideFinalCta =
    pathname === "/contact" ||
    pathname === "/checkout" ||
    pathname === "/create-pack" ||
    pathname === "/events-bulk" ||
    pathname === "/faqs" ||
    pathname === "/order-confirmation" ||
    pathname === "/shipping-and-delivery" ||
    pathname === "/terms-and-conditions" ||
    pathname.startsWith("/shop/") ||
    pathname.startsWith("/products/");  // ← product pages pe hide

  return (
    <>
      {!hideFinalCta ? <FinalCtaBlock /> : null}
      <SiteFooter />
      <WhatsAppWidget />
    </>
  );
}
