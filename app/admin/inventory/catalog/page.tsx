"use client";

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Plus, MoreVertical, Edit3, Image, Copy, XCircle, Trash2, ChevronDown, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

// ── Imported Shared Components ─────────────────────────────────────────────────
import ProductFilters from '../_components/ProductFilters';
import BulkActionBar from '../_components/BulkActionBar';
import { InlineEditCell, InlineStockCell } from '../_components/InlineEditCells';
import InlineEditRow from '../_components/InlineEditRow';
import SaveAllBar from '../_components/SaveAllBar';

export default function MasterCatalogPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'Active' | 'Draft' | 'Featured'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState('all');
  const [listingTypeFilter, setListingTypeFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // ── Inline Edit State (for InlineEditRow + SaveAllBar) ────────────────────
  const [editValues, setEditValues] = useState<Record<string, { price: string; stock: string }>>({});
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(25);
  const [showPerPageDropdown, setShowPerPageDropdown] = useState(false);
  const perPageRef = useRef<HTMLDivElement>(null);

  const PER_PAGE_OPTIONS = [10, 25, 50, 100];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
      if (perPageRef.current && !perPageRef.current.contains(e.target as Node)) setShowPerPageDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery, categoryFilter, subCategoryFilter, listingTypeFilter, resultsPerPage]);

  const fetchAll = async () => {
    setLoading(true);
    const { data: cats } = await supabase.from('categories').select('id, name, slug').order('name', { ascending: true });
    setCategories(cats || []);
    const { data: prods } = await supabase
      .from('magnetify_products')
      .select(`*, sub_categories(id, name, slug, category_id, categories(id, name, slug))`)
      .order('created_at', { ascending: false });
    const fetchedProds = prods || [];
    setProducts(fetchedProds);

    // ── Init editValues for InlineEditRow ──
    const initEdit: Record<string, { price: string; stock: string }> = {};
    fetchedProds.forEach((p: any) => {
      initEdit[p.id] = {
        price: p.price?.toString() || '',
        stock: p.stock?.toString() || '0',
      };
    });
    setEditValues(initEdit);
    setDirtyIds(new Set());
    setSelectedIds(new Set());
    setLoading(false);
  };

  // ── Inline Edit Handlers ──────────────────────────────────────────────────
  const handleFieldChange = (productId: string, field: 'price' | 'stock', value: string) => {
    setEditValues(prev => ({ ...prev, [productId]: { ...prev[productId], [field]: value } }));
    setDirtyIds(prev => new Set(prev).add(productId));
  };

  const handleCancelEdit = (productId: string) => {
    const original = products.find(p => p.id === productId);
    if (!original) return;
    setEditValues(prev => ({
      ...prev,
      [productId]: { price: original.price?.toString() || '', stock: original.stock?.toString() || '0' },
    }));
    setDirtyIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
  };

  const handleSaveSingle = async (productId: string) => {
    const vals = editValues[productId];
    if (!vals) return;
    const price = parseFloat(vals.price) || 0;
    const stock = parseInt(vals.stock) || 0;
    setSavingIds(prev => new Set(prev).add(productId));
    try {
      await supabase.from('magnetify_products').update({ price, stock }).eq('id', productId);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, price, stock } : p));
      setDirtyIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
    } finally {
      setSavingIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
    }
  };

  const handleSaveAll = async () => {
    if (dirtyIds.size === 0) return;
    setBulkLoading(true);
    try {
      for (const id of dirtyIds) {
        const vals = editValues[id];
        if (!vals) continue;
        const price = parseFloat(vals.price) || 0;
        const stock = parseInt(vals.stock) || 0;
        await supabase.from('magnetify_products').update({ price, stock }).eq('id', id);
        setProducts(prev => prev.map(p => p.id === id ? { ...p, price, stock } : p));
      }
      setDirtyIds(new Set());
    } finally {
      setBulkLoading(false);
    }
  };

  const resetDirtyEdits = () => {
    setEditValues(prev => {
      const next = { ...prev };
      products.forEach(p => {
        if (dirtyIds.has(p.id)) {
          next[p.id] = { price: p.price?.toString() || '', stock: p.stock?.toString() || '0' };
        }
      });
      return next;
    });
    setDirtyIds(new Set());
  };

  // ── Old per-cell inline save (still used for InlineEditCell / InlineStockCell on variation rows) ──
  const handleInlineSave = async (productId: string, field: string, value: any) => {
    await supabase.from('magnetify_products').update({ [field]: value }).eq('id', productId);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, [field]: value } : p));
  };

  const handleCategoryChange = async (catId: string) => {
    setCategoryFilter(catId);
    setSubCategoryFilter('all');
    if (catId === 'all') { setSubCategories([]); return; }
    const { data: subs } = await supabase.from('sub_categories').select('id, name, slug').eq('category_id', catId).order('name', { ascending: true });
    setSubCategories(subs || []);
  };

  const filtered = products.filter((p) => {
    const matchTab = activeTab === 'all' || p.status === activeTab;
    const matchSearch = p.title_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.sub_categories?.categories?.id === categoryFilter;
    const matchSub = subCategoryFilter === 'all' || p.sub_categories?.id === subCategoryFilter;
    const matchType = listingTypeFilter === 'all' || p.listing_type === listingTypeFilter;
    return matchTab && matchSearch && matchCat && matchSub && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / resultsPerPage));
  const paginatedProducts = filtered.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);
  const startItem = filtered.length === 0 ? 0 : (currentPage - 1) * resultsPerPage + 1;
  const endItem = Math.min(currentPage * resultsPerPage, filtered.length);

  const tabCounts = {
    all: products.length,
    Active: products.filter(p => p.status === 'Active').length,
    Draft: products.filter(p => p.status === 'Draft').length,
    Featured: products.filter(p => p.status === 'Featured').length,
  };

  const allPageSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    const newSet = new Set(selectedIds);
    if (allPageSelected) { paginatedProducts.forEach(p => newSet.delete(p.id)); }
    else { paginatedProducts.forEach(p => newSet.add(p.id)); }
    setSelectedIds(newSet);
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  // ── Bulk Actions ──────────────────────────────────────────────────────────
  const bulkDelete = async () => {
    if (!confirm(`DANGER: ${selectedIds.size} products delete ho jayenge. Proceed?`)) return;
    setBulkLoading(true);
    for (const id of selectedIds) await supabase.from('magnetify_products').delete().eq('id', id);
    fetchAll();
    setBulkLoading(false);
  };

  const bulkClose = async () => {
    setBulkLoading(true);
    for (const id of selectedIds) await supabase.from('magnetify_products').update({ status: 'Draft' }).eq('id', id);
    fetchAll();
    setBulkLoading(false);
  };

  const bulkFeatured = async () => {
    setBulkLoading(true);
    for (const id of selectedIds) await supabase.from('magnetify_products').update({ status: 'Featured' }).eq('id', id);
    fetchAll();
    setBulkLoading(false);
  };

  const bulkShowInPack = async (show: boolean) => {
    setBulkLoading(true);
    for (const id of selectedIds) await supabase.from('magnetify_products').update({ show_in_pack: show }).eq('id', id);
    fetchAll();
    setBulkLoading(false);
  };

  const allSelectedInPack = selectedIds.size > 0 &&
    [...selectedIds].every(id => products.find(p => p.id === id)?.show_in_pack === true);

  // ── Single Actions ────────────────────────────────────────────────────────
  const handleDelete = async (productId: string) => {
    if (!confirm("DANGER: Product permanently delete ho jayega. Proceed?")) return;
    await supabase.from('magnetify_products').delete().eq('id', productId);
    fetchAll();
    setOpenMenuId(null);
  };

  const handleClose = async (productId: string) => {
    await supabase.from('magnetify_products').update({ status: 'Draft' }).eq('id', productId);
    fetchAll();
    setOpenMenuId(null);
  };

  const handleCopy = async (product: any) => {
    const { id, created_at, updated_at, slug, sub_categories, ...rest } = product;
    const newSlug = rest.title_name.toLowerCase().replace(/\s+/g, '-') + '-copy-' + Date.now();
    await supabase.from('magnetify_products').insert([{ ...rest, slug: newSlug, title_name: rest.title_name + ' (Copy)', status: 'Draft' }]);
    fetchAll();
    setOpenMenuId(null);
  };

  const getEditPath = (product: any) => {
    const catSlug = product.sub_categories?.categories?.slug;
    const subSlug = product.sub_categories?.slug;
    if (catSlug && subSlug) return `/admin/inventory/${catSlug}/${subSlug}/${product.id}`;
    return '#';
  };

  // ── Price renderer: variation = InlineEditCell, single = InlineEditRow style ──
  const renderVariationPrice = (product: any) => {
    const sets = product.product_sets || [];
    const variations = product.variations || [];
    if (sets.length > 0) return (
      <div className="space-y-1">
        {sets.map((s: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[9px] text-white/30 font-bold uppercase">{s.size || `Set ${i + 1}`}</span>
            <span className="text-[11px] font-black text-[#FEDE00] italic">₹{s.price || '—'}</span>
          </div>
        ))}
      </div>
    );
    if (variations.length > 0) return (
      <div className="space-y-1">
        {variations.map((v: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[9px] text-white/30 font-bold uppercase">{v.label || `Option ${i + 1}`}</span>
            <span className="text-[11px] font-black text-[#FEDE00] italic">₹{v.price || '—'}</span>
          </div>
        ))}
      </div>
    );
    return <span className="text-white/20 text-xs">—</span>;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <p className="text-[#FEDE00] font-black uppercase tracking-widest text-xs animate-pulse">Loading Catalog...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">

      {/* HEADER */}
      <div className="border-b border-white/5 px-8 py-6 flex justify-between items-center sticky top-0 bg-[#0A0A0A] z-40">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Manage All Listings</h1>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Magnetify Studio / Inventory</p>
        </div>
        <div className="flex items-center gap-3">
          {/* ── SaveAllBar: sirf tab dikhega jab unsaved edits hon ── */}
          <SaveAllBar
            dirtyCount={dirtyIds.size}
            loading={bulkLoading}
            onSaveAll={handleSaveAll}
          />
          <Link href="/admin/inventory" className="bg-[#FEDE00] text-black px-6 py-3 rounded-xl font-black uppercase text-[11px] flex items-center gap-2 hover:scale-[0.98] transition-all">
            <Plus size={16} strokeWidth={3} /> Add Product
          </Link>
        </div>
      </div>

      <div className="px-8 py-6">

        {/* TABS */}
        <div className="flex items-center gap-1 mb-6 border-b border-white/5">
          {(['all', 'Active', 'Draft', 'Featured'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-[2px] ${activeTab === tab ? 'border-[#FEDE00] text-[#FEDE00]' : 'border-transparent text-white/30 hover:text-white/60'}`}>
              {tab === 'all' ? 'All Listings' : tab}
              <span className={`ml-2 text-[9px] px-2 py-0.5 rounded-full font-black ${activeTab === tab ? 'bg-[#FEDE00]/20 text-[#FEDE00]' : 'bg-white/5 text-white/30'}`}>{tabCounts[tab]}</span>
            </button>
          ))}
        </div>

        {/* FILTERS */}
        <ProductFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          categoryFilter={categoryFilter}
          onCategoryChange={handleCategoryChange}
          subCategories={subCategories}
          subCategoryFilter={subCategoryFilter}
          onSubCategoryChange={setSubCategoryFilter}
          listingTypeFilter={listingTypeFilter}
          onListingTypeChange={setListingTypeFilter}
        />

        {/* TABLE */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-visible">

          {/* Table Header */}
          <div className="grid grid-cols-[40px_60px_2fr_1.2fr_1.5fr_120px_140px_100px_60px] gap-4 px-6 py-4 border-b border-white/5 bg-white/[0.02] rounded-t-2xl items-center">
            <div onClick={toggleSelectAll} className="cursor-pointer flex items-center justify-center">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                allPageSelected ? 'bg-[#FEDE00] border-[#FEDE00]' : someSelected ? 'bg-[#FEDE00]/30 border-[#FEDE00]/50' : 'border-white/20 hover:border-white/40'
              }`}>
                {allPageSelected && <span className="text-black text-[10px] font-black">✓</span>}
                {!allPageSelected && someSelected && <span className="text-[#FEDE00] text-[10px] font-black">—</span>}
              </div>
            </div>
            {['', 'Product', 'Category', 'Price (₹)', 'Status', 'Stock', 'Save', ''].map((h, i) => (
              <div key={i} className="text-[9px] font-black uppercase tracking-widest text-white/25">{h}</div>
            ))}
          </div>

          {/* Table Rows */}
          {paginatedProducts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-white/20 font-black uppercase text-xs tracking-widest">No listings found</p>
            </div>
          ) : (
            paginatedProducts.map((product) => {
              const isVariation = product.listing_type === 'variation';
              const vals = editValues[product.id] || { price: product.price?.toString() || '', stock: product.stock?.toString() || '0' };
              const isDirty = dirtyIds.has(product.id);
              const isSaving = savingIds.has(product.id);

              return (
                <div key={product.id}
                  className={`grid grid-cols-[40px_60px_2fr_1.2fr_1.5fr_120px_140px_100px_60px] gap-4 px-6 py-4 border-b border-white/[0.04] transition-all items-center group ${
                    isDirty ? 'bg-[#FEDE00]/[0.03] border-l-2 border-l-[#FEDE00]/40' :
                    selectedIds.has(product.id) ? 'bg-[#FEDE00]/[0.04] border-l-2 border-l-[#FEDE00]/30' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Checkbox */}
                  <div onClick={() => toggleSelect(product.id)} className="cursor-pointer flex items-center justify-center">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      selectedIds.has(product.id) ? 'bg-[#FEDE00] border-[#FEDE00]' : 'border-white/20 hover:border-white/50'
                    }`}>
                      {selectedIds.has(product.id) && <span className="text-black text-[10px] font-black">✓</span>}
                    </div>
                  </div>

                  {/* Image */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/5 flex-shrink-0">
                    {product.main_image
                      ? <img src={product.main_image} alt="" className="w-full h-full object-cover object-center" />
                      : <div className="w-full h-full flex items-center justify-center text-white/10 text-[8px] font-black">N/A</div>
                    }
                  </div>

                  {/* Product Name */}
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <a href={getEditPath(product)} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-black uppercase tracking-tight text-white leading-tight line-clamp-1 hover:text-[#FEDE00] transition-colors cursor-pointer underline-offset-2 hover:underline decoration-[#FEDE00]/40">
                        {product.title_name}
                      </a>
                      {isVariation && (
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FEDE00]/10 text-[#FEDE00] border border-[#FEDE00]/20 flex-shrink-0">Variation</span>
                      )}
                      {product.show_in_pack && (
                        <span className="flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex-shrink-0">
                          <ShoppingBag size={9} /> In Pack
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/30 font-medium">{product.sub_categories?.name || '—'}</p>
                  </div>

                  {/* Category */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                      {product.sub_categories?.categories?.name || '—'}
                    </span>
                  </div>

                  {/* ── InlineEditRow: Price + Stock + Save/Cancel (3 cells) ── */}
                  {isVariation ? (
                    <>
                      {/* Variation: old per-cell editors */}
                      <div>{renderVariationPrice(product)}</div>
                      <div>
                        {/* variation status */}
                        <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border ${
                          product.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          product.status === 'Featured' ? 'bg-[#FEDE00]/10 text-[#FEDE00] border-[#FEDE00]/20' :
                          'bg-white/5 text-white/30 border-white/10'
                        }`}>{product.status || 'Draft'}</span>
                      </div>
                      <div>
                        <InlineStockCell value={product.stock} productId={product.id} onSave={handleInlineSave} />
                      </div>
                      <div><span className="text-white/10 text-[9px] font-black uppercase">—</span></div>
                    </>
                  ) : (
                    <>
                      {/* Single listing: InlineEditRow handles Price + Stock + Save/Cancel */}
                      <InlineEditRow
                        productId={product.id}
                        vals={vals}
                        isDirty={isDirty}
                        isSaving={isSaving}
                        isVariation={false}
                        onFieldChange={handleFieldChange}
                        onSave={handleSaveSingle}
                        onCancel={handleCancelEdit}
                      />
                      {/* Status — sits after InlineEditRow's 3 cells */}
                      <div>
                        <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border ${
                          product.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          product.status === 'Featured' ? 'bg-[#FEDE00]/10 text-[#FEDE00] border-[#FEDE00]/20' :
                          'bg-white/5 text-white/30 border-white/10'
                        }`}>{product.status || 'Draft'}</span>
                      </div>
                    </>
                  )}

                  {/* Actions menu */}
                  <div className="relative flex justify-end">
                    <button onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                      className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all">
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === product.id && (
                      <div ref={menuRef} className="absolute right-0 top-full mt-2 w-52 rounded-2xl z-[9999] overflow-hidden"
                        style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
                        <a href={getEditPath(product)} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 px-5 py-3.5 text-[11px] font-black uppercase transition-all"
                          style={{ color: 'rgba(255,255,255,0.85)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <Edit3 size={14} className="text-[#FEDE00]" /> Edit Listing
                        </a>
                        <a href={getEditPath(product)} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 px-5 py-3.5 text-[11px] font-black uppercase transition-all"
                          style={{ color: 'rgba(255,255,255,0.85)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <Image size={14} className="text-[#FEDE00]" /> Edit Images
                        </a>
                        <button onClick={() => handleCopy(product)} className="w-full flex items-center gap-3 px-5 py-3.5 text-[11px] font-black uppercase transition-all"
                          style={{ color: 'rgba(255,255,255,0.85)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <Copy size={14} className="text-[#FEDE00]" /> Copy Listing
                        </button>
                        <button onClick={() => handleClose(product.id)} className="w-full flex items-center gap-3 px-5 py-3.5 text-[11px] font-black uppercase transition-all"
                          style={{ color: 'rgba(255,255,255,0.85)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <XCircle size={14} className="text-orange-400" /> Close Listing
                        </button>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />
                        <button onClick={() => handleDelete(product.id)} className="w-full flex items-center gap-3 px-5 py-3.5 text-[11px] font-black uppercase text-red-400 transition-all"
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <Trash2 size={14} /> Delete Listing
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION FOOTER */}
        <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
            {filtered.length === 0 ? 'No results' : `Showing ${startItem}–${endItem} of ${filtered.length} listings`}
          </p>

          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className={`p-2 rounded-xl border transition-all ${currentPage === 1 ? 'border-white/5 text-white/15 cursor-not-allowed' : 'border-white/10 text-white/50 hover:border-[#FEDE00]/40 hover:text-[#FEDE00]'}`}>
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .reduce((acc: (number | string)[], page, idx, arr) => {
                if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                acc.push(page);
                return acc;
              }, [])
              .map((page, i) =>
                page === '...'
                  ? <span key={i} className="px-2 text-white/20 text-[11px] font-black">···</span>
                  : <button key={i} onClick={() => setCurrentPage(page as number)}
                      className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all border ${
                        currentPage === page ? 'bg-[#FEDE00] text-black border-[#FEDE00]' : 'border-white/10 text-white/40 hover:border-[#FEDE00]/40 hover:text-[#FEDE00]'
                      }`}>
                      {page}
                    </button>
              )}

            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className={`p-2 rounded-xl border transition-all ${currentPage === totalPages ? 'border-white/5 text-white/15 cursor-not-allowed' : 'border-white/10 text-white/50 hover:border-[#FEDE00]/40 hover:text-[#FEDE00]'}`}>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="relative" ref={perPageRef}>
            <button onClick={() => setShowPerPageDropdown(v => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-[11px] font-black uppercase text-white/50 hover:border-[#FEDE00]/30 hover:text-white/80 transition-all">
              {resultsPerPage} per page
              <ChevronDown size={12} className={`transition-transform ${showPerPageDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showPerPageDropdown && (
              <div className="absolute right-0 bottom-full mb-2 rounded-xl overflow-hidden z-[9999] min-w-[160px]"
                style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
                <p className="text-[8px] font-black uppercase text-white/20 tracking-widest px-4 pt-3 pb-2">Results per page</p>
                {PER_PAGE_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => { setResultsPerPage(opt); setShowPerPageDropdown(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-[11px] font-black uppercase transition-all ${
                      resultsPerPage === opt ? 'text-[#FEDE00] bg-[#FEDE00]/10' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}>
                    <span>{opt} results per page</span>
                    {resultsPerPage === opt && <span className="text-[#FEDE00]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      <BulkActionBar
        dirtyCount={dirtyIds.size}
        onSaveAll={handleSaveAll}
        selectedCount={selectedIds.size}
        bulkLoading={bulkLoading}
        allSelectedInPack={allSelectedInPack}
        onDelete={bulkDelete}
        onClose={bulkClose}
        onFeatured={bulkFeatured}
        onShowInPack={bulkShowInPack}
        onCancel={() => { resetDirtyEdits(); setSelectedIds(new Set()); }}
      />

    </div>
  );
}