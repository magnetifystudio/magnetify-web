import type { Metadata } from "next";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteTail } from "@/components/site-tail";
import { HomepagePopupWidget } from "@/components/homepage-popup-widget";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Magnetify Studio",
    template: "%s | Magnetify Studio",
  },
  description:
    "Custom photo, round, square, and premium music magnets for gifting and memory walls.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full bg-background text-foreground">
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteTail />
            {/* ✅ Popup — DB se config fetch karke show karta hai */}
            <HomepagePopupWidget />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
