"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4">
      {/* Main Image */}
      <div className="group relative aspect-square overflow-hidden rounded-[1.5rem] border border-black/5 bg-[#f5f5f5]">
        <Image
          key={selected}
          src={images[selected]}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 px-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200 sm:h-20 sm:w-20 ${
                selected === i
                  ? "border-[#FF385C] shadow-[0_4px_14px_rgba(255,56,92,0.3)] scale-105"
                  : "border-transparent opacity-50 hover:opacity-90 hover:scale-102"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
