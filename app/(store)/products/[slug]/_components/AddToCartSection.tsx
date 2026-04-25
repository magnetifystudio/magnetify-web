"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SetOption {
  size: string;
  price: string | number;
  compare_price?: string | number;
  label?: string;
}

interface VariationOption {
  label: string;
  price: string | number;
  compare_price?: string | number;
}

interface Props {
  isSingle: boolean;
  price?: string | number;
  comparePrice?: string | number;
  sets: SetOption[];
  variations: VariationOption[];
  variationType?: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  photoCount?: number; // ← Added photoCount prop
}

export default function AddToCartSection({
  isSingle,
  price,
  comparePrice,
  sets,
  variations,
  variationType,
  productId,
  productTitle,
  productSlug,
  photoCount, // ← Destructured here
}: Props) {
  const router = useRouter();
  const [selectedSetIdx, setSelectedSetIdx] = useState(0);
  const [selectedVarIdx, setSelectedVarIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  const handleAddToCart = () => {
    let setCount = 1;
    let selectedPrice = price;
    let selectedLabel = "Single";

    // 1. Sets wali listing logic
    if (sets.length > 0) {
      const selected = sets[selectedSetIdx];
      selectedPrice = selected.price;
      selectedLabel = selected.size?.toString() || "";
      
      // Extract number from string like "Set of 4" or "Pack of 2"
      const numMatch = selectedLabel.match(/(\d+)/);
      setCount = numMatch ? parseInt(numMatch[1]) : 1;
    } 
    // 2. Single listing logic
    else if (isSingle) {
      selectedPrice = price;
      setCount = photoCount || 1; // ← Using photoCount update here
      selectedLabel = "Single";
    } 
    // 3. Variations logic
    else if (variations.length > 0) {
      const selected = variations[selectedVarIdx];
      selectedPrice = selected.price;
      selectedLabel = selected.label || "";
      setCount = 1;
    }

    // Redirect to upload-photos with query params
    router.push(
      `/upload-photos?id=${productId}` +
      `&title=${encodeURIComponent(productTitle)}` +
      `&price=${selectedPrice}` +
      `&priceLabel=${encodeURIComponent(`₹${selectedPrice}`)}` +
      `&set=${setCount}` +
      `&label=${encodeURIComponent(selectedLabel)}` +
      `&slug=${productSlug}`
    );
  };

  const CartButton = () => (
    <button
      onClick={handleAddToCart}
      className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-base transition-all duration-300 shadow-lg active:scale-[0.98] ${
        added
          ? "bg-green-500 text-white shadow-green-500/30 scale-[0.99]"
          : "bg-[#FF385C] text-white hover:bg-[#e0184f] hover:shadow-[#FF385C]/40 hover:-translate-y-0.5 shadow-[#FF385C]/30"
      }`}
    >
      {added ? "✓ Added to Cart!" : "Add to Cart"}
    </button>
  );

  const QtySelector = () => (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-[#1a1a1a]/50">Qty:</span>
      <div className="flex items-center gap-2 bg-[#F7F4F0] rounded-xl px-2 py-1">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-light text-[#1a1a1a] hover:bg-[#FF385C] hover:text-white transition-all duration-200"
        >
          −
        </button>
        <span className="text-base font-bold min-w-[24px] text-center text-[#1a1a1a]">
          {qty}
        </span>
        <button
          onClick={() => setQty((q) => q + 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-light text-[#1a1a1a] hover:bg-[#FF385C] hover:text-white transition-all duration-200"
        >
          +
        </button>
      </div>
    </div>
  );

  // ── SINGLE LISTING VIEW ──────────────────────────────────
  if (isSingle && sets.length === 0 && variations.length === 0) {
    const discount =
      comparePrice && price
        ? Math.round((1 - Number(price) / Number(comparePrice)) * 100)
        : null;

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-4xl font-bold text-[#1a1a1a]">₹{price}</span>
          {comparePrice && (
            <span className="text-lg text-[#1a1a1a]/30 line-through font-medium">
              ₹{comparePrice}
            </span>
          )}
          {discount && (
            <span className="bg-[#FF385C] text-white text-[11px] font-black uppercase px-3 py-1 rounded-full">
              {discount}% OFF
            </span>
          )}
        </div>
        <QtySelector />
        <CartButton />
      </div>
    );
  }

  // ── SETS VIEW ───────────────────────────────────────────
  if (sets.length > 0) {
    const selected = sets[selectedSetIdx];
    const discount =
      selected?.compare_price && selected?.price
        ? Math.round(
            (1 - Number(selected.price) / Number(selected.compare_price)) * 100
          )
        : null;

    return (
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]/40 mb-3">
            Choose Your Set
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sets.map((set, i) => {
              const setDiscount =
                set.compare_price && set.price
                  ? Math.round(
                      (1 - Number(set.price) / Number(set.compare_price)) * 100
                    )
                  : null;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedSetIdx(i)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-0.5 ${
                    selectedSetIdx === i
                      ? "border-[#FF385C] bg-[#FF385C]/[0.03] shadow-[0_4px_14px_rgba(255,56,92,0.12)]"
                      : "border-black/8 hover:border-black/20 bg-white hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-[14px] font-semibold text-[#1a1a1a]">
                      {set.size}
                    </p>
                    {set.label && (
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          set.label.toLowerCase().includes("popular") ||
                          set.label.toLowerCase().includes("best")
                            ? "bg-[#FF385C]/10 text-[#FF385C]"
                            : "bg-black/5 text-[#1a1a1a]/50"
                        }`}
                      >
                        {set.label}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-[#1a1a1a]">₹{set.price}</p>
                  {set.compare_price && (
                    <p className="text-[12px] text-[#1a1a1a]/35 mt-0.5">
                      {setDiscount && setDiscount > 0
                        ? `Save ₹${Number(set.compare_price) - Number(set.price)}`
                        : `MRP ₹${set.compare_price}`}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl font-bold text-[#1a1a1a]">₹{selected?.price}</span>
          {selected?.compare_price && (
            <span className="text-base text-[#1a1a1a]/30 line-through">
              ₹{selected.compare_price}
            </span>
          )}
          {discount && discount > 0 && (
            <span className="bg-[#FF385C] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
              {discount}% OFF
            </span>
          )}
        </div>

        <QtySelector />
        <CartButton />
      </div>
    );
  }

  // ── VARIATIONS VIEW ─────────────────────────────────────
  if (variations.length > 0) {
    const selected = variations[selectedVarIdx];

    return (
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]/40 mb-3">
            {variationType ? `Choose ${variationType}` : "Choose Option"}
          </p>
          <div className="flex flex-wrap gap-2">
            {variations.map((v, i) => (
              <button
                key={i}
                onClick={() => setSelectedVarIdx(i)}
                className={`px-4 py-2.5 rounded-xl border-2 text-[13px] font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                  selectedVarIdx === i
                    ? "border-[#FF385C] bg-[#FF385C]/[0.04] text-[#FF385C] shadow-[0_4px_14px_rgba(255,56,92,0.12)]"
                    : "border-black/10 text-[#1a1a1a]/70 hover:border-black/25 hover:shadow-sm"
                }`}
              >
                {v.label}
                <span className="ml-1.5 text-[12px] font-black">₹{v.price}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl font-bold text-[#1a1a1a]">₹{selected?.price}</span>
          {selected?.compare_price && (
            <span className="text-base text-[#1a1a1a]/30 line-through">
              ₹{selected.compare_price}
            </span>
          )}
        </div>

        <QtySelector />
        <CartButton />
      </div>
    );
  }

  return null;
}
