"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { CartIcon } from "@/components/site-icons";
import { ShopMegaMenu } from "@/components/shop-mega-menu";

const primaryLinks = [
  { href: "/events-bulk", label: "EVENTS & BULK", accent: "gold" as const },
  { href: "/track-order", label: "TRACK ORDER" },
  { href: "/contact", label: "CONTACT" },
];

const DEFAULT_ANNOUNCEMENT = "Free Delivery on orders above Rs. 999! | Deliveries across India in 4-5 days";

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);
  const [announcementText, setAnnouncementText] = useState(DEFAULT_ANNOUNCEMENT);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false); // mobile shop submenu

  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const fetchAnnouncement = useCallback(async () => {
    const { data } = await supabase
      .from("announcement_bar")
      .select("text")
      .eq("is_active", true)
      .single();
    if (data?.text) setAnnouncementText(data.text);
  }, [supabase]);

  const fetchNavCategories = useCallback(async () => {
    const { data } = await supabase
      .from("categories")
      .select(`*, sub_categories (*)`)
      .order("display_order", { ascending: true });

    if (data) {
      setDynamicCategories(data.map(cat => {
        const effectiveSlug = cat.slug || encodeURIComponent(cat.name.toLowerCase());
        return {
          ...cat,
          label: cat.name,
          slug: effectiveSlug,
          href: `/${effectiveSlug}`,
          previewImage: cat.image_url || "/placeholder-category.jpg",
          items: cat.sub_categories || []
        };
      }));
    }
  }, [supabase]);

  useEffect(() => {
    fetchAnnouncement();
    fetchNavCategories();

    const channel = supabase
      .channel('header-db-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchNavCategories)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sub_categories' }, fetchNavCategories)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcement_bar' }, fetchAnnouncement)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchNavCategories, fetchAnnouncement]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShopOpen(false);
  }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-charcoal text-pearl shadow-lg">

        {/* Announcement Bar */}
        <div className="border-b border-white/8 bg-[linear-gradient(90deg,rgba(212,175,55,0.18),rgba(255,140,55,0.16))] overflow-hidden py-2">
          <div className="announcement-marquee flex w-max">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="whitespace-nowrap px-8 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90 sm:px-12 sm:text-xs sm:tracking-widest"
              >
                {announcementText}
              </span>
            ))}
          </div>
        </div>

        {/* Main header row */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:gap-4 sm:py-3">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <Image
              src="/favicon.png"
              alt="Magnetify Studio"
              width={34}
              height={34}
              className="rounded-full"
            />
            <span className="hidden text-base font-black uppercase leading-none tracking-tighter sm:block">
              MAGNETIFY
            </span>
          </Link>

          {/* Desktop nav — only lg+ */}
          <nav className="hidden lg:flex items-center gap-8">
            {dynamicCategories.length > 0 && <ShopMegaMenu categories={dynamicCategories} />}
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-bold tracking-widest transition-colors hover:text-orange ${
                  link.accent === "gold" ? "text-gold" : "text-white/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* CTA button — hidden on mobile, shown sm+ */}
            <Link
              href="/create-pack"
              className="hidden sm:block rounded-full bg-[#ff1b6b] px-4 py-2 text-xs font-bold text-white hover:scale-105 transition-transform whitespace-nowrap lg:px-6 lg:text-sm"
            >
              Create Your Pack
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Open cart"
            >
              <CartIcon className="size-5 sm:size-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange size-5 rounded-full text-[10px] flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Hamburger — visible below lg */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="lg:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="flex flex-col gap-1.5 w-5">
                <span
                  className={`block h-0.5 bg-white rounded transition-all duration-300 origin-center ${
                    mobileMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 bg-white rounded transition-all duration-300 ${
                    mobileMenuOpen ? "opacity-0 scale-x-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 bg-white rounded transition-all duration-300 origin-center ${
                    mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile / Tablet Drawer ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-[88vw] max-w-sm flex-col bg-charcoal shadow-2xl transition-transform duration-300 ease-in-out sm:w-[78vw] lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6 sm:py-5">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
            <Image src="/favicon.png" alt="Magnetify" width={32} height={32} className="rounded-full" />
            <span className="font-black tracking-tighter text-base uppercase text-white">MAGNETIFY</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close menu"
          >
            <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">

          {/* Shop — expandable if categories exist */}
          {dynamicCategories.length > 0 && (
            <div>
              <button
                onClick={() => setShopOpen(o => !o)}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white/80 transition-colors hover:bg-white/8 hover:text-white"
              >
                SHOP ALL
                <svg
                  className={`size-4 transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Categories list */}
              {shopOpen && (
                <div className="mt-1 ml-4 space-y-0.5 border-l border-white/10 pl-4">
                  {dynamicCategories.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/8 hover:text-white"
                    >
                      {cat.previewImage && cat.previewImage !== "/placeholder-category.jpg" && (
                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white/10">
                          <Image src={cat.previewImage} alt={cat.label} width={32} height={32} className="object-cover w-full h-full" />
                        </div>
                      )}
                      <span className="font-semibold">{cat.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Primary links */}
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] transition-colors hover:bg-white/8 ${
                link.accent === "gold" ? "text-gold" : "text-white/80 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Drawer CTA */}
        <div className="px-4 py-5 border-t border-white/10">
          <Link
            href="/create-pack"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full rounded-full bg-[#ff1b6b] py-3.5 text-center text-sm font-bold text-white hover:bg-[#e0165f] transition-colors"
          >
            ✨ Create Your Pack
          </Link>
        </div>
      </div>
    </>
  );
}
