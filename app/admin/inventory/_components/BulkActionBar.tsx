"use client";

import { Save, Trash2, XCircle, Star, ShoppingBag } from "lucide-react";

interface BulkActionBarProps {
  // ── Inline-edit state (optional — only pass on pages that have inline edits) ──
  dirtyCount?: number;
  onSaveAll?: () => void;

  // ── Bulk-select state ────────────────────────────────────────────────────────
  selectedCount: number;
  bulkLoading: boolean;
  allSelectedInPack: boolean;

  onDelete: () => void;
  onClose: () => void;
  onFeatured: () => void;
  /** Called with `true` to add to pack, `false` to remove */
  onShowInPack: (show: boolean) => void;
  /** Resets both dirty edits AND clears selection */
  onCancel: () => void;
}

/**
 * BulkActionBar
 * Floating bottom bar that appears when rows are selected OR there are
 * unsaved inline edits (or both at the same time).
 *
 * — On pages WITHOUT inline editing: just don't pass `dirtyCount` / `onSaveAll`
 * — On pages WITH inline editing: pass both and the Save-All section appears automatically
 *
 * Usage (inline-edit page):
 *   <BulkActionBar
 *     dirtyCount={dirtyIds.size}
 *     onSaveAll={handleSaveAll}
 *     selectedCount={selectedIds.size}
 *     bulkLoading={bulkLoading}
 *     allSelectedInPack={allSelectedInPack}
 *     onDelete={bulkDelete}
 *     onClose={bulkClose}
 *     onFeatured={bulkFeatured}
 *     onShowInPack={(show) => bulkToggleShowInPack(show)}
 *     onCancel={() => { resetDirtyEdits(); setSelectedIds(new Set()); }}
 *   />
 *
 * Usage (select-only page — old behaviour, nothing changes):
 *   <BulkActionBar
 *     selectedCount={selectedIds.size}
 *     bulkLoading={bulkLoading}
 *     allSelectedInPack={allSelectedInPack}
 *     onDelete={bulkDelete}
 *     onClose={bulkClose}
 *     onFeatured={bulkFeatured}
 *     onShowInPack={(show) => bulkToggleShowInPack(show)}
 *     onCancel={() => setSelectedIds(new Set())}
 *   />
 */
export default function BulkActionBar({
  dirtyCount = 0,
  onSaveAll,
  selectedCount,
  bulkLoading,
  allSelectedInPack,
  onDelete,
  onClose,
  onFeatured,
  onShowInPack,
  onCancel,
}: BulkActionBarProps) {
  const hasDirty = dirtyCount > 0;
  const hasSelected = selectedCount > 0;

  if (!hasDirty && !hasSelected) return null;

  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
      style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.15)" }}
    >
      {/* ── UNSAVED EDITS SECTION (only on inline-edit pages) ─────────────── */}
      {hasDirty && onSaveAll && (
        <>
          <span className="text-green-400 font-black text-sm mr-1">
            {dirtyCount} unsaved
          </span>
          <button
            onClick={onSaveAll}
            disabled={bulkLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase text-green-400 hover:bg-green-500/10 transition-all border border-green-500/20 disabled:opacity-50"
          >
            <Save size={13} /> Save All
          </button>

          {/* Divider — only shown when both sections are visible */}
          {hasSelected && <div className="w-px h-5 bg-white/10" />}
        </>
      )}

      {/* ── BULK SELECT SECTION ────────────────────────────────────────────── */}
      {hasSelected && (
        <>
          <span className="text-[#FEDE00] font-black text-sm mr-2">
            {selectedCount} selected
          </span>

          <div className="w-px h-5 bg-white/10" />

          <button
            onClick={onDelete}
            disabled={bulkLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
          >
            <Trash2 size={13} /> Delete
          </button>

          <button
            onClick={onClose}
            disabled={bulkLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase text-orange-400 hover:bg-orange-500/10 transition-all border border-orange-500/20"
          >
            <XCircle size={13} /> Close
          </button>

          <button
            onClick={onFeatured}
            disabled={bulkLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase text-[#FEDE00] hover:bg-[#FEDE00]/10 transition-all border border-[#FEDE00]/20"
          >
            <Star size={13} /> Label as Featured
          </button>

          <div className="w-px h-5 bg-white/10" />

          {/* Show in Pack / Remove from Pack — exact logic from original */}
          {allSelectedInPack ? (
            <button
              onClick={() => onShowInPack(false)}
              disabled={bulkLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase text-blue-400 hover:bg-blue-500/10 transition-all border border-blue-500/20"
            >
              <ShoppingBag size={13} /> Remove from Pack
            </button>
          ) : (
            <button
              onClick={() => onShowInPack(true)}
              disabled={bulkLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase text-blue-400 hover:bg-blue-500/10 transition-all border border-blue-500/20"
            >
              <ShoppingBag size={13} /> Show in Pack
            </button>
          )}
        </>
      )}

      {/* ── CANCEL ─────────────────────────────────────────────────────────── */}
      <div className="w-px h-5 bg-white/10" />
      <button
        onClick={onCancel}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase text-white/40 hover:text-white hover:bg-white/5 transition-all"
      >
        Cancel
      </button>
    </div>
  );
}
