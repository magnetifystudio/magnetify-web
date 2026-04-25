"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ScrollReveal } from "@/components/scroll-reveal";

type FeaturedProduct = {
  id: string;
  title_name: string;
  price: number;
  main_image: string;
  slug: string;
  display_order: number;
};

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {direction === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

export function FeaturedProductsCarouselClient({
  products,
}: {
  products: FeaturedProduct[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const updateScrollState = () => {
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
      setCanScrollLeft(scroller.scrollLeft > 8);
      setCanScrollRight(scroller.scrollLeft < maxScrollLeft - 8);
    };
    updateScrollState();
    scroller.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      scroller.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const amount = Math.min(scroller.clientWidth * 0.92, 460);
    scroller.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-[#e6ddd3] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <ScrollReveal variant="up">
          <h2 className="text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl lg:text-5xl">Featured Items</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted sm:text-base sm:leading-8">A fast-scroll lineup of current best picks, premium keepsakes, and customer-favorite magnet packs.</p>
        </ScrollReveal>
        <ScrollReveal variant="up" delay={120} className="flex items-center gap-3 sm:justify-end">
          <button type="button" aria-label="Scroll left" onClick={() => handleScroll("left")} disabled={!canScrollLeft}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e7d2bf] bg-white text-charcoal shadow-[0_10px_24px_rgba(26,26,27,0.08)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:text-charcoal/35 sm:h-14 sm:w-14">
            <ArrowIcon direction="left" />
          </button>
          <button type="button" aria-label="Scroll right" onClick={() => handleScroll("right")} disabled={!canScrollRight}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e7d2bf] bg-white text-charcoal shadow-[0_10px_24px_rgba(26,26,27,0.08)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:text-charcoal/35 sm:h-14 sm:w-14">
            <ArrowIcon direction="right" />
          </button>
        </ScrollReveal>
      </div>

      <div className="-mx-4 mt-6 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div ref={scrollerRef} className="scrollbar-hidden -mb-6 overflow-x-auto px-1 pb-6">
          <div className="flex min-w-max snap-x snap-mandatory gap-5">
            {products.map((product, index) => (
              <ScrollReveal key={product.id} delay={index * 90} variant="up" className="w-[min(85vw,22rem)] shrink-0 snap-start sm:w-[23rem] lg:w-[24rem]">
                <article className="group flex flex-col gap-4 rounded-[1.9rem] border border-black/6 bg-white p-4 shadow-[0_20px_45px_rgba(26,26,27,0.12)] transition-transform duration-300 hover:-translate-y-1 sm:flex-row sm:items-center sm:px-5 sm:py-4">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.6rem] bg-white shadow-[0_14px_26px_rgba(26,26,27,0.08)] sm:h-24 sm:w-24 sm:shrink-0 sm:aspect-square">
                    <Image src={product.main_image} alt={product.title_name} fill className="object-cover" sizes="(max-width: 639px) 85vw, 96px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-foreground line-clamp-2 sm:text-[1.45rem]">{product.title_name}</h3>
                    <p className="mt-1 text-base font-medium text-charcoal/85">₹{product.price}</p>
                    <AddToCartButton
                      item={{ id: product.id, title: product.title_name, price: product.price, priceLabel: `₹${product.price}`, imageSrc: product.main_image, imageAlt: product.title_name, href: `/products/${product.slug}` }}
                      className="mt-4 inline-flex w-full justify-center rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(255,27,107,0.24)] hover:-translate-y-0.5 hover:bg-orange sm:w-auto"
                    >
                      Shop Now
                    </AddToCartButton>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
