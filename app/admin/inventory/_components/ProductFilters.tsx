"use client";

import { Search, ChevronDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;

  categories: Category[];
  categoryFilter: string;
  onCategoryChange: (val: string) => void;

  subCategories: SubCategory[];
  subCategoryFilter: string;
  onSubCategoryChange: (val: string) => void;

  listingTypeFilter: string;
  onListingTypeChange: (val: string) => void;

  // Optional: hide subcategory filter (e.g. on subCategory page where it's already fixed)
  showSubCategoryFilter?: boolean;
  // Optional: hide category filter (e.g. on category page where it's already fixed)
  showCategoryFilter?: boolean;
}

export default function ProductFilters({
  searchQuery,
  onSearchChange,
  categories,
  categoryFilter,
  onCategoryChange,
  subCategories,
  subCategoryFilter,
  onSubCategoryChange,
  listingTypeFilter,
  onListingTypeChange,
  showSubCategoryFilter = true,
  showCategoryFilter = true,
}: ProductFiltersProps) {
  return (
    <div className="flex gap-3 mb-6 flex-wrap">

      {/* Search */}
      <div className="flex-1 min-w-[200px] relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by product name..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all font-medium"
        />
      </div>

      {/* Category Filter */}
      {showCategoryFilter && (
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-3 text-[11px] font-black uppercase text-white/60 outline-none focus:border-[#FEDE00]/50 pr-10 cursor-pointer min-w-[160px]"
          >
            <option value="all" style={{ background: '#1a1a1a', color: '#fff' }}>All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id} style={{ background: '#1a1a1a', color: '#fff' }}>{cat.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
      )}

      {/* Sub-Category Filter — only shows when a category is selected */}
      {showSubCategoryFilter && categoryFilter !== 'all' && subCategories.length > 0 && (
        <div className="relative">
          <select
            value={subCategoryFilter}
            onChange={(e) => onSubCategoryChange(e.target.value)}
            className="appearance-none bg-[#1a1a1a] border border-[#FEDE00]/30 rounded-xl px-5 py-3 text-[11px] font-black uppercase text-white/60 outline-none focus:border-[#FEDE00]/50 pr-10 cursor-pointer min-w-[160px]"
          >
            <option value="all" style={{ background: '#1a1a1a', color: '#fff' }}>All Sub-Categories</option>
            {subCategories.map(sub => (
              <option key={sub.id} value={sub.id} style={{ background: '#1a1a1a', color: '#fff' }}>{sub.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
      )}

      {/* Listing Type Filter */}
      <div className="relative">
        <select
          value={listingTypeFilter}
          onChange={(e) => onListingTypeChange(e.target.value)}
          className="appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-3 text-[11px] font-black uppercase text-white/60 outline-none focus:border-[#FEDE00]/50 pr-10 cursor-pointer min-w-[150px]"
        >
          <option value="all" style={{ background: '#1a1a1a', color: '#fff' }}>All Types</option>
          <option value="single" style={{ background: '#1a1a1a', color: '#fff' }}>Single Listing</option>
          <option value="variation" style={{ background: '#1a1a1a', color: '#fff' }}>Variation</option>
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
      </div>

    </div>
  );
}
