"use client";

import { Save } from "lucide-react";

interface SaveAllBarProps {
  dirtyCount: number;
  loading?: boolean;
  onSaveAll: () => void;
}

/**
 * SaveAllBar
 * A standalone "Save All Changes" button shown in the page header
 * whenever there are unsaved inline edits (dirtyCount > 0).
 *
 * Usage (inside your header):
 *   {hasDirty && (
 *     <SaveAllBar
 *       dirtyCount={dirtyIds.size}
 *       loading={bulkLoading}
 *       onSaveAll={handleSaveAll}
 *     />
 *   )}
 */
export default function SaveAllBar({ dirtyCount, loading = false, onSaveAll }: SaveAllBarProps) {
  if (dirtyCount === 0) return null;

  return (
    <button
      onClick={onSaveAll}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 font-black uppercase text-[11px] hover:bg-green-500/25 transition-all disabled:opacity-50"
    >
      <Save size={14} strokeWidth={3} />
      Save All Changes
      <span className="bg-green-500/20 text-green-300 text-[9px] px-2 py-0.5 rounded-full font-black">
        {dirtyCount}
      </span>
    </button>
  );
}
