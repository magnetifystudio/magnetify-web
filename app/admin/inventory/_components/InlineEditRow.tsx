"use client";

import { Save, X } from "lucide-react";

interface InlineEditRowProps {
  productId: string;
  vals: { price: string; stock: string };
  isDirty: boolean;
  isSaving: boolean;
  isVariation?: boolean;
  onFieldChange: (productId: string, field: "price" | "stock", value: string) => void;
  onSave: (productId: string) => void;
  onCancel: (productId: string) => void;
  /** Optional: rendered in place of price input for variation products */
  variationPriceNode?: React.ReactNode;
}

/**
 * InlineEditRow
 * Renders the Price cell, Stock cell, and Save/Cancel cell for a single
 * product row in any inventory catalog page.
 *
 * Usage:
 *   <InlineEditRow
 *     productId={product.id}
 *     vals={editValues[product.id]}
 *     isDirty={dirtyIds.has(product.id)}
 *     isSaving={savingIds.has(product.id)}
 *     isVariation={product.listing_type === "variation"}
 *     onFieldChange={handleFieldChange}
 *     onSave={handleSaveSingle}
 *     onCancel={handleCancelEdit}
 *     variationPriceNode={renderVariationPrice(product)}
 *   />
 */
export default function InlineEditRow({
  productId,
  vals,
  isDirty,
  isSaving,
  isVariation = false,
  onFieldChange,
  onSave,
  onCancel,
  variationPriceNode,
}: InlineEditRowProps) {
  return (
    <>
      {/* ── PRICE CELL ──────────────────────────────────────── */}
      <div>
        {isVariation && variationPriceNode ? (
          variationPriceNode
        ) : (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs font-black pointer-events-none">
              ₹
            </span>
            <input
              type="number"
              min="0"
              value={vals.price}
              onChange={(e) => onFieldChange(productId, "price", e.target.value)}
              className={`w-full pl-7 pr-3 py-2 rounded-lg text-sm font-black text-white outline-none transition-all ${
                isDirty
                  ? "bg-[#FEDE00]/10 border border-[#FEDE00]/50 text-[#FEDE00]"
                  : "bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#FEDE00]/50"
              }`}
              placeholder="0"
            />
          </div>
        )}
      </div>

      {/* ── STOCK CELL ──────────────────────────────────────── */}
      <div>
        <input
          type="number"
          min="0"
          value={vals.stock}
          onChange={(e) => onFieldChange(productId, "stock", e.target.value)}
          className={`w-full px-3 py-2 rounded-lg text-sm font-black text-white outline-none transition-all ${
            isDirty
              ? "bg-[#FEDE00]/10 border border-[#FEDE00]/50 text-[#FEDE00]"
              : parseInt(vals.stock) === 0
              ? "bg-red-500/10 border border-red-500/20 text-red-400"
              : "bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#FEDE00]/50"
          }`}
          placeholder="0"
        />
      </div>

      {/* ── SAVE / CANCEL CELL ──────────────────────────────── */}
      <div className="flex items-center gap-1">
        {isDirty ? (
          <>
            <button
              onClick={() => onSave(productId)}
              disabled={isSaving}
              title="Save"
              className="p-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/20 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <span className="text-[9px] font-black animate-pulse">...</span>
              ) : (
                <Save size={13} />
              )}
            </button>
            <button
              onClick={() => onCancel(productId)}
              title="Cancel"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white border border-white/10 transition-all"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <span className="text-white/10 text-[9px] font-black uppercase">—</span>
        )}
      </div>
    </>
  );
}
