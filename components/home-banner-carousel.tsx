"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Banner = {
  id: string;
  image_url: string;
  vibe: string;
  headline: string;
  subheadline: string;
  cta_label: string;
  cta_href: string;
  display_order: number;
  is_active: boolean;
};

// Fallback slides agar DB empty ho
const FALLBACK_SLIDES: Banner[] = [
  {
    id: "1",
    image_url: "/magnetify-studio-custom-fridge-magnets-acrylic-frames-lifestyle.png",
    vibe: "Heartwarming & Personal",
    headline: "Memories That Stick Forever.",
    subheadline: "Turn your favorite memories into fridge magnets and premium frames, because every photo tells a story.",
    cta_label: "Shop Custom Magnets",
    cta_href: "/shop/classic-magnets",
    display_order: 1,
    is_active: true,
  },
  {
    id: "2",
    image_url: "/magnetify-studio-heritage-grid-personalized-photo-frame-gift-wrap.png",
    vibe: "Joyful & Gift-Focused",
    headline: "The Perfect Gift for Every Story.",
    subheadline: "Whether it is a birthday or an anniversary, our customized products make every occasion feel special.",
    cta_label: "Order a Gift Now",
    cta_href: "/shop/frames-displays",
    display_order: 2,
    is_active: true,
  },
  {
    id: "3",
    image_url: "/magnetify-studio-premium-acrylic-photo-blocks-desk-decor.png",
    vibe: "Premium & Aesthetic",
    headline: "Modern Decor for Modern Homes.",
    subheadline: "Introducing Magnetify Acrylic Frames and Crystal Ornaments. Sleek, scratch-resistant, and truly unique.",
    cta_label: "Explore Collection",
    cta_href: "/shop/acrylic-collection",
    display_order: 3,
    is_active: true,
  },
  {
    id: "4",
    image_url: "/magnetify-studio-lifestyle-handheld-photo-magnets-trust-banner.png",
    vibe: "Reliable & Professional",
    headline: "Your Quality, Our Promise.",
    subheadline: "Premium glossy finish, waterproof durability, and scratch-resistant quality with India-wide delivery.",
    cta_label: "Start Creating",
    cta_href: "/create-pack",
    display_order: 4,
    is_active: true,
  },
];

const AUTOPLAY_MS = 5000;

export function HomeBannerCarousel() {
  const supabase = createClient();
  const [slides, setSlides] = useState<Banner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (data && data.length > 0) {
        setSlides(data);
      } else {
        setSlides(FALLBACK_SLIDES);
      }
      setLoaded(true);
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(intervalId);
  }, [slides]);

  if (!loaded || slides.length === 0) return (
    <div className="w-full min-h-[420px] bg-charcoal sm:min-h-[520px] lg:min-h-[620px]" />
  );

  return (
    <section className="w-full">
      <div className="relative overflow-hidden bg-charcoal">
        <div className="relative min-h-[420px] sm:min-h-[520px] lg:min-h-[620px]">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  isActive ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                {slide.image_url && (
                  <Image
                    src={slide.image_url}
                    alt={slide.headline}
                    fill
                    priority={index === 0}
                    className={`object-cover transition-transform duration-[1400ms] ease-out ${
                      isActive ? "scale-[1.08] sm:scale-[1.1]" : "scale-[1.03] sm:scale-[1.05]"
                    }`}
                    sizes="100vw"
                  />
                )}

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(26,26,27,0.34)_0%,rgba(26,26,27,0.14)_34%,rgba(26,26,27,0.05)_66%,rgba(26,26,27,0.1)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,26,27,0.08)_0%,rgba(26,26,27,0.24)_100%)]" />

                <div className="absolute inset-0">
                  <div className="mx-auto flex min-h-[420px] w-full max-w-7xl items-end justify-start px-4 pb-7 pt-8 sm:min-h-[520px] sm:px-6 sm:pb-12 sm:pt-10 lg:min-h-[620px] lg:px-5 lg:pb-16">
                    <div className={`w-full max-w-[25rem] rounded-[1.55rem] border border-white/22 bg-white/14 px-4 py-4 text-white shadow-[0_28px_80px_rgba(26,26,27,0.2)] backdrop-blur-xl transition-all duration-700 ease-out sm:max-w-[27rem] sm:rounded-[1.85rem] sm:px-5 sm:py-5 lg:max-w-[31rem] lg:px-6 lg:py-6 ${
                      isActive ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
                    }`}>
                      {slide.vibe && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/86 backdrop-blur sm:gap-3 sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.32em]">
                          <span className="size-2 rounded-full bg-pink shadow-[0_0_0_6px_rgba(255,27,107,0.14)]" />
                          {slide.vibe}
                        </div>
                      )}
                      <h1 className="mt-4 max-w-3xl text-[2.25rem] leading-[0.96] tracking-[-0.05em] text-white sm:text-[2.8rem] lg:text-[3.45rem]">
                        {slide.headline}
                      </h1>
                      {slide.subheadline && (
                        <p className="mt-4 max-w-lg text-[13px] leading-6 text-white/82 sm:text-[15px] sm:leading-7">
                          {slide.subheadline}
                        </p>
                      )}
                      {slide.cta_label && slide.cta_href && (
                        <div className="mt-6">
                          <Link
                            href={slide.cta_href}
                            className="inline-flex items-center justify-center rounded-full bg-pink px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(255,27,107,0.35)] hover:-translate-y-0.5 hover:bg-orange sm:px-6 sm:py-3.5"
                          >
                            {slide.cta_label}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 right-4 z-10 flex gap-2 rounded-full border border-white/12 bg-charcoal/65 px-2.5 py-1.5 backdrop-blur sm:bottom-6 sm:right-6 sm:px-3 sm:py-2 lg:right-8">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-200 ${
                index === activeIndex ? "w-8 bg-pink" : "w-2.5 bg-white/45 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
