import { Trash2, XCircle, Star, ShoppingBag } from 'lucide-react';

interface BulkBarProps {
  selectedIds: Set<string>;
  bulkLoading: boolean;
  allSelectedInPack: boolean;
  onDelete: () => void;
  onClose: () => void;
  onFeatured: () => void;
  onTogglePack: () => void;
  onClear: () => void;
}

export const BulkActionBar = ({ 
  selectedIds, 
  bulkLoading, 
  allSelectedInPack, 
  onDelete, 
  onClose, 
  onFeatured, 
  onTogglePack, 
  onClear 
}: BulkBarProps) => {
  // Agar koi listing select nahi hai, to bar nahi dikhegi
  if (selectedIds.size === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-[#1A1A1A] border border-white/15">
      
      {/* Selection Count */}
      <span className="text-[#FEDE00] font-black text-sm mr-2">{selectedIds.size} selected</span>
      
      <div className="w-px h-5 bg-white/10" />

      {/* Delete Action */}
      <button onClick={onDelete} disabled={bulkLoading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20 disabled:opacity-50">
        <Trash2 size={13} /> Delete
      </button>

      {/* Close/Draft Action */}
      <button onClick={onClose} disabled={bulkLoading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase text-orange-400 hover:bg-orange-500/10 transition-all border border-orange-500/20 disabled:opacity-50">
        <XCircle size={13} /> Close
      </button>

      {/* Featured Action */}
      <button onClick={onFeatured} disabled={bulkLoading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase text-[#FEDE00] hover:bg-[#FEDE00]/10 transition-all border border-[#FEDE00]/20 disabled:opacity-50">
        <Star size={13} /> Label as Featured
      </button>

      <div className="w-px h-5 bg-white/10" />

      {/* Show/Hide in Pack (Main Purpose) */}
      <button onClick={onTogglePack} disabled={bulkLoading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase text-blue-400 hover:bg-blue-500/10 transition-all border border-blue-500/20 disabled:opacity-50">
        <ShoppingBag size={13} /> 
        {allSelectedInPack ? 'Remove from Pack' : 'Show in Pack'}
      </button>

      <div className="w-px h-5 bg-white/10" />

      {/* Cancel Button */}
      <button onClick={onClear} className="text-[11px] font-black uppercase text-white/40 hover:text-white transition-all">
        Cancel
      </button>
      
    </div>
  );
};