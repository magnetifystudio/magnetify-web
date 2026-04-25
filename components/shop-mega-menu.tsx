"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

function ArrowIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M4.25 10H15.75M10.75 5L15.75 10L10.75 15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShopMegaMenu({ categories = [] }: { categories?: any[] }) {
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState("");

  useEffect(() => {
    if (categories && categories.length > 0) {
      if (!activeSlug || !categories.find(c => c.slug === activeSlug)) {
        setActiveSlug(categories[0].slug);
      }
    }
  }, [categories, activeSlug]);

  const activeCategory = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    return categories.find((cat) => cat.slug === activeSlug) || categories[0];
  }, [activeSlug, categories]);

  const subItems = useMemo(() => {
    if (!activeCategory) return [];
    return activeCategory.items || activeCategory.products || activeCategory.sub_categories || [];
  }, [activeCategory]);

  function clearCloseTimeout() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  function openMenu() {
    clearCloseTimeout();
    setIsOpen(true);
  }

  function closeMenu() {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 140);
  }

  if (!categories || categories.length === 0) return null;

  return (
    <div className="static" onMouseEnter={openMenu} onMouseLeave={closeMenu} onFocus={openMenu}>
      <Link
        href="/#shop-all"
        className={`whitespace-nowrap text-sm tracking-[0.2em] transition-colors duration-200 hover:text-orange ${
          isOpen ? "text-orange" : "text-white/78"
        }`}
      >
        SHOP ALL
      </Link>

      <div
        className={`absolute inset-x-0 top-full z-50 pt-4 transition-all duration-300 ${
          isOpen ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2"
        }`}
        onMouseEnter={openMenu}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="w-full rounded-[2rem] border border-[#eadfd5] bg-[#fcf8f2]/98 p-5 shadow-[0_34px_100px_rgba(26,26,27,0.18)] backdrop-blur-sm xl:p-6 text-charcoal">
            <div className="grid gap-6 xl:grid-cols-[255px_285px_minmax(0,1fr)]">
              
              {/* Left Column: Categories */}
              <div className="xl:border-r xl:border-[#eadfd5] xl:pr-6">
                <div className="space-y-1.5">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/${category.slug}`}
                      onMouseEnter={() => setActiveSlug(category.slug)}
                      className={`group/item relative block rounded-[1.25rem] border px-4 py-3 transition-all ${
                        activeSlug === category.slug 
                          ? "border-[#ead7ca] bg-[#efe5d9] shadow-sm font-bold" 
                          : "border-transparent hover:bg-[#f5ede4]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[1.04rem]">{category.label || category.name}</span>
                        <ArrowIcon className={`size-4 transition-transform ${activeSlug === category.slug ? "translate-x-1" : "opacity-30"}`} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Middle Column: Subcategories — FIXED ROUTING */}
              <div className="xl:border-r xl:border-[#eadfd5] xl:pr-6">
                <div className="space-y-1.5">
                  {subItems.length > 0 ? (
                    subItems.slice(0, 10).map((item: any) => {
                      // /classic-magnets/magnetify-square format
                      const catSlug = activeCategory?.slug || "";
                      const href = `/${catSlug}/${item.slug || item.id}`;

                      return (
                        <Link
                          key={item.id}
                          href={href}
                          className="group/sub block rounded-[1.2rem] px-4 py-3 hover:bg-[#efe5d9] transition-all border border-transparent hover:border-[#ead7ca]"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[0.95rem] font-medium text-charcoal group-hover/sub:text-orange">
                                {item.name || item.label || "Untitled"}
                              </p>
                            </div>
                            <ArrowIcon className="size-3 opacity-0 group-hover/sub:opacity-100 transition-all -translate-x-1 group-hover/sub:translate-x-0 text-orange" />
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center opacity-40 italic text-sm">
                      Coming Soon...
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Dynamic Preview */}
              <div className="relative overflow-hidden rounded-[1.7rem] border border-[#eadfd5] bg-white group shadow-sm">
                {(activeCategory?.previewImage || activeCategory?.image_url || activeCategory?.main_image_url) ? (
                  <Link href={`/${activeCategory?.slug}`} className="block h-full w-full relative">
                    <Image
                      src={activeCategory?.previewImage || activeCategory?.image_url || activeCategory?.main_image_url}
                      alt={activeCategory?.name || "Category Preview"}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="500px"
                      priority
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[300px] text-[10px] opacity-20 uppercase font-bold italic bg-[#fcf8f2]">
                    Magnetify Studio
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
