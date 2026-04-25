"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// Types for better organization
export interface ProductGallerySlide {
  id: string;
  label: string;
  type: "image" | "feature";
  src: string;
  alt: string;
}

export interface ProductFeature {
  title: string;
  detail: string;
}

export interface ProductSetOption {
  id: string;
  label: string;
  price: string;
  hint?: string;
}

export interface ProductDetailItem {
  title: string;
  detail: string;
}

export interface ProductTrustPoint {
  title: string;
  detail: string;
}

export function PremiumProductShowcase({
  title,
  subtitle,
  eyebrow,
  gallerySlides,
  setOptions,
  keyFeatures,
  productDetails,
  trustPoints,
  trustHeading,
  trustSubheading,
}: any) {
  const [activeImage, setActiveImage] = useState(gallerySlides[0]?.src);
  const [openDetail, setOpenDetail] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* LEFT: IMAGE GALLERY */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
            <img 
              src={activeImage} 
              alt={title} 
              className="h-full w-full object-cover transition-all duration-500"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {gallerySlides?.filter((s: any) => s.type === "image").map((slide: any) => (
              <button
                key={slide.id}
                onClick={() => setActiveImage(slide.src)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                  activeImage === slide.src ? "border-pink-500 scale-95 shadow-md" : "border-gray-100 opacity-60"
                }`}
              >
                <img src={slide.src} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: PRODUCT INFO & WHY BUY */}
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500 mb-3 bg-pink-50 px-3 py-1 rounded-full w-fit">
            {eyebrow || "Premium Collection"}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]">
            {title}
          </h1>
          <p className="mt-4 text-lg text-gray-500 font-medium leading-relaxed">
            {subtitle}
          </p>

          {/* WHY BUY CARD (Craftsmanship Section) */}
          <div className="mt-10 rounded-[2.5rem] bg-[#FAF7F2] p-8 border border-[#F0EBE3] shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C4A484] mb-6">
              Why Buy
            </h3>
            <div className="space-y-6">
              {keyFeatures?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE: TRUST POINTS & PRICING */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-gray-100 pt-16">
        
        {/* WHY MAGNETIFY STUDIO */}
        <div className="rounded-[2.5rem] bg-white border border-gray-100 p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-900">{trustHeading}</h2>
            <p className="mt-3 text-gray-500 text-sm leading-relaxed">{trustSubheading}</p>
            <div className="mt-10 grid grid-cols-2 gap-8">
              {trustPoints?.map((tp: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="h-10 w-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 mb-3">
                    <div className="w-5 h-5 bg-pink-400 rounded-full opacity-30 animate-pulse"></div>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{tp.title}</h4>
                  <p className="text-[11px] text-gray-400 leading-normal">{tp.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIZE & PRICING */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-2">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-500">Pick your format</h3>
             <p className="text-sm text-gray-400">Select the best size for your memories</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {setOptions?.map((opt: any, i: number) => (
              <div 
                key={opt.id} 
                className={`group relative rounded-[2rem] border-2 p-6 transition-all cursor-pointer ${
                  i === 0 ? 'border-pink-500 bg-white shadow-md' : 'border-gray-100 hover:border-pink-200 bg-gray-50/30'
                }`}
              >
                {opt.hint && (
                  <span className="absolute -top-3 left-6 bg-pink-500 text-white text-[9px] px-3 py-1 rounded-full font-bold uppercase italic shadow-md z-20">
                    {opt.hint}
                  </span>
                )}
                <p className="font-bold text-gray-600 text-xs uppercase tracking-wide group-hover:text-pink-500 transition-colors">
                  {opt.label}
                </p>
                <p className="text-2xl font-black mt-1 text-gray-900 tracking-tight">{opt.price}</p>
              </div>
            ))}
          </div>
          
          <button className="w-full rounded-full bg-yellow-400 py-5 text-sm font-black uppercase tracking-[0.2em] text-gray-900 shadow-[0_12px_24px_rgba(250,204,21,0.3)] hover:bg-yellow-500 hover:-translate-y-1 transition-all active:scale-95">
            Add to Cart
          </button>
        </div>
      </div>

      {/* BOTTOM: PRODUCT DETAILS ACCORDION */}
      <div className="mt-20 border-t border-gray-100 pt-12">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500 mb-8">Product Details</h3>
        <div className="max-w-4xl divide-y divide-gray-100">
          {productDetails?.map((item: any, i: number) => (
            <div key={i} className="py-5">
              <button 
                onClick={() => setOpenDetail(openDetail === i ? null : i)}
                className="flex w-full items-center justify-between text-left group"
              >
                <span className="text-sm font-bold text-gray-700 uppercase tracking-[0.05em] group-hover:text-pink-500 transition-colors">
                  {item.title}
                </span>
                <span className="text-gray-300 group-hover:text-pink-500 transition-colors">
                  {openDetail === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
              </button>
              {openDetail === i && (
                <div className="mt-4 text-sm text-gray-500 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                  {item.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}