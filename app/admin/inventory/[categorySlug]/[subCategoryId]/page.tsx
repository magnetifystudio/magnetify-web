"use client";

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Plus, MoreVertical, Edit3, Copy, XCircle, Trash2, ChevronDown, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

// ── _components imports ───────────────────────────────────────────────────────
import BulkActionBar from '../../_components/BulkActionBar';
import InlineEditRow from '../../_components/InlineEditRow';
import SaveAllBar from '../../_components/SaveAllBar';
import ProductFilters from '../../_components/ProductFilters';
// Note: InlineEditCells (InlineEditCell / InlineStockCell) manages its own
// per-cell state and conflicts with the bulk-save pattern used here.
// Use InlineEditRow instead on this page.

import {
  moveProductAction,
  deleteProductAction,
  updateProductFieldsAction,
  updateProductStatusAction,
  bulkSaveProductEditsAction,
  bulkDeleteProductsAction,
  bulkUpdateProductStatusAction,
  bulkToggleShowInPackAction,
} from './actions';

export default function SubCategoryCatalogPage({ params }: { params: Promise<{ categorySlug: string; subCategoryId: string }> }) {
  const [categorySlug, setCategorySlug] = useState("");
  const [subCategorySlug, setSubCategorySlug] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'Active' | 'Draft' | 'Featured'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(25);
  const [showPerPageDropdown, setShowPerPageDropdown] = useState(false);
  const PER_PAGE_OPTIONS = [10, 25, 50, 100];

  // Bulk
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Inline Edit State
  const [editValues, setEditValues] = useState<Record<string, { price: string; stock: string }>>({});
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const perPageRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
      if (perPageRef.current && !perPageRef.current.contains(e.target as Node)) setShowPerPageDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    params.then(({ categorySlug, subCategoryId }) => {
      setCategorySlug(categorySlug);
      setSubCategorySlug(subCategoryId);
      fetchData(categorySlug, subCategoryId);
    });
  }, []);

  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery, listingTypeFilter, resultsPerPage]);

  const fetchData = async (catSlug: string, subSlug: string) => {
    setLoading(true);
    const { data: category } = await supabase.from('categories').select('id, name').eq('slug', catSlug).single();
    if (category) setCategoryName(category.name);

    const { data: subCategory } = await supabase.from('sub_categories').select('id, name').eq('slug', subSlug).single();
    if (subCategory) {
      setSubCategoryName(subCategory.name);
      const { data: prods } = await supabase
        .from('magnetify_products')
        .select('*')
        .eq('sub_category_id', subCategory.id)
        .order('display_order', { ascending: true });
      const fetchedProds = prods || [];
      setProducts(fetchedProds);

      const initEdit: Record<string, { price: string; stock: string }> = {};
      fetchedProds.forEach((p: any) => {
        initEdit[p.id] = {
          price: p.price?.toString() || '',
          stock: p.stock?.toString() || '0',
        };
      });
      setEditValues(initEdit);
      setDirtyIds(new Set());
    }
    setSelectedIds(new Set());
    setLoading(false);
  };

  // ── Inline edit handlers ──────────────────────────────────────────────────
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

  const resetDirtyEdits = (ids?: Iterable<string>) => {
    const targetIds = ids ? new Set(ids) : new Set(dirtyIds);
    if (targetIds.size === 0) return;
    setEditValues(prev => {
      const next = { ...prev };
      products.forEach((product) => {
        if (!targetIds.has(product.id)) return;
        next[product.id] = { price: product.price?.toString() || '', stock: product.stock?.toString() || '0' };
      });
      return next;
    });
    setDirtyIds(prev => { const n = new Set(prev); targetIds.forEach(id => n.delete(id)); return n; });
  };

  const handleSaveSingle = async (productId: string) => {
    const vals = editValues[productId];
    if (!vals) return;
    const price = parseFloat(vals.price) || 0;
    const stock = parseInt(vals.stock) || 0;
    setSavingIds(prev => new Set(prev).add(productId));
    try {
      await updateProductFieldsAction(productId, price, stock, categorySlug, subCategorySlug);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, price, stock } : p));
      setDirtyIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
    } finally {
      setSavingIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
    }
  };

  const handleSaveAll = async () => {
    const updates = Array.from(dirtyIds).map(id => ({
      id,
      price: parseFloat(editValues[id]?.price || '0') || 0,
      stock: parseInt(editValues[id]?.stock || '0') || 0,
    }));
    if (updates.length === 0) return;
    setBulkLoading(true);
    try {
      await bulkSaveProductEditsAction(updates, categorySlug, subCategorySlug);
      const updateMap = new Map(updates.map(u => [u.id, u]));
      setProducts(prev => prev.map(p => { const n = updateMap.get(p.id); return n ? { ...p, price: n.price, stock: n.stock } : p; }));
      setDirtyIds(new Set());
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const matchTab = activeTab === 'all' || p.status === activeTab;
    const matchSearch = p.title_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = listingTypeFilter === 'all' || p.listing_type === listingTypeFilter;
    return matchTab && matchSearch && matchType;
  });

  const tabCounts = {
    all: products.length,
    Active: products.filter(p => p.status === 'Active').length,
    Draft: products.filter(p => p.status === 'Draft').length,
    Featured: products.filter(p => p.status === 'Featured').length,
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / resultsPerPage));
  const paginatedProducts = filtered.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);
  const startItem = filtered.length === 0 ? 0 : (currentPage - 1) * resultsPerPage + 1;
  const endItem = Math.min(currentPage * resultsPerPage, filtered.length);

  const allPageSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0;
  const selectedProducts = products.filter(p => selectedIds.has(p.id));
  const allSelectedInPack = selectedProducts.length > 0 && selectedProducts.every(p => p.show_in_pack === true);

  // ── Select handlers ───────────────────────────────────────────────────────
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

  // ── Row action handlers ───────────────────────────────────────────────────
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;
    const current = products[index];
    const target = products[targetIndex];
    const updated = [...products];
    updated[index] = { ...target, display_order: current.display_order };
    updated[targetIndex] = { ...current, display_order: target.display_order };
    setProducts(updated);
    await moveProductAction(current.id, target.display_order, target.id, current.display_order, categorySlug, subCategorySlug);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("DANGER: Product permanently delete ho jayega. Proceed?")) return;
    await deleteProductAction(productId, categorySlug, subCategorySlug);
    setProducts(prev => prev.filter(p => p.id !== productId));
    setEditValues(prev => { const n = { ...prev }; delete n[productId]; return n; });
    setDirtyIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
    setOpenMenuId(null);
  };

  const handleClose = async (productId: string) => {
    await updateProductStatusAction(productId, 'Draft', categorySlug, subCategorySlug);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'Draft' } : p));
    setOpenMenuId(null);
  };

  const handleCopy = async (product: any) => {
    const { id, created_at, updated_at, slug, ...rest } = product;
    const newSlug = rest.title_name.toLowerCase().replace(/\s+/g, '-') + '-copy-' + Date.now();
    const maxOrder = products.reduce((max, p) => Math.max(max, p.display_order || 0), 0);
    const newProduct = { ...rest, slug: newSlug, title_name: rest.title_name + ' (Copy)', status: 'Draft', display_order: maxOrder + 1 };
    const { data } = await supabase.from('magnetify_products').insert([newProduct]).select().single();
    if (data) {
      setProducts(prev => [...prev, data]);
      setEditValues(prev => ({ ...prev, [data.id]: { price: data.price?.toString() || '', stock: data.stock?.toString() || '0' } }));
    }
    setOpenMenuId(null);
  };

  // ── Bulk action handlers ──────────────────────────────────────────────────
  const bulkDelete = async () => {
    if (!confirm(`DANGER: ${selectedIds.size} products delete ho jayenge. Proceed?`)) return;
    setBulkLoading(true);
    try {
      const ids = Array.from(selectedIds);
      await bulkDeleteProductsAction(ids, categorySlug, subCategorySlug);
      const deleted = new Set(ids);
      setProducts(prev => prev.filter(p => !deleted.has(p.id)));
      setEditValues(prev => { const n = { ...prev }; deleted.forEach(id => delete n[id]); return n; });
      setDirtyIds(prev => { const n = new Set(prev); deleted.forEach(id => n.delete(id)); return n; });
      setSelectedIds(new Set());
    } finally { setBulkLoading(false); }
  };

  const bulkClose = async () => {
    setBulkLoading(true);
    try {
      const ids = Array.from(selectedIds);
      await bulkUpdateProductStatusAction(ids, 'Draft', categorySlug, subCategorySlug);
      const closed = new Set(ids);
      setProducts(prev => prev.map(p => closed.has(p.id) ? { ...p, status: 'Draft' } : p));
      setSelectedIds(new Set());
    } finally { setBulkLoading(false); }
  };

  const bulkFeatured = async () => {
    setBulkLoading(true);
    try {
      const ids = Array.from(selectedIds);
      await bulkUpdateProductStatusAction(ids, 'Featured', categorySlug, subCategorySlug);
      const featured = new Set(ids);
      setProducts(prev => prev.map(p => featured.has(p.id) ? { ...p, status: 'Featured' } : p));
      setSelectedIds(new Set());
    } finally { setBulkLoading(false); }
  };

  const handleShowInPack = async (show: boolean) => {
    if (!someSelected) return;
    setBulkLoading(true);
    try {
      const ids = Array.from(selectedIds);
      await bulkToggleShowInPackAction(ids, show, categorySlug, subCategorySlug);
      const selected = new Set(ids);
      setProducts(prev => prev.map(p => selected.has(p.id) ? { ...p, show_in_pack: show } : p));
      setSelectedIds(new Set());
    } finally { setBulkLoading(false); }
  };

  // ── Variation price renderer ──────────────────────────────────────────────
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

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-white/5 px-8 py-6 flex justify-between items-center sticky top-0 bg-[#0A0A0A] z-40">
        <div>
          <nav className="flex gap-2 text-[9px] font-black uppercase tracking-widest text-white/20 mb-2">
            <Link href="/admin/inventory" className="hover:text-[#FEDE00] transition-colors">Inventory</Link>
            <span>/</span>
            <Link href={`/admin/inventory/${categorySlug}`} className="hover:text-[#FEDE00] transition-colors">{categoryName}</Link>
            <span>/</span>
            <span className="text-[#FEDE00]">{subCategoryName}</span>
          </nav>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">{subCategoryName}</h1>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Magnetify Studio / Inventory</p>
        </div>
        <div className="flex items-center gap-3">
          {/* SaveAllBar — sirf tab dikhega jab unsaved edits hon */}
          <SaveAllBar
            dirtyCount={dirtyIds.size}
            loading={bulkLoading}
            onSaveAll={handleSaveAll}
          />
          <Link
            href={`/admin/inventory/${categorySlug}/${subCategorySlug}/new`}
            className="bg-[#FEDE00] text-black px-6 py-3 rounded-xl font-black uppercase text-[11px] flex items-center gap-2 hover:scale-[0.98] transition-all"
          >
            <Plus size={16} strokeWidth={3} /> Add New Product
          </Link>
        </div>
      </div>

      <div className="px-8 py-6">

        {/* ── TABS ───────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 mb-6 border-b border-white/5">
          {(['all', 'Active', 'Draft', 'Featured'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-[2px] ${activeTab === tab ? 'border-[#FEDE00] text-[#FEDE00]' : 'border-transparent text-white/30 hover:text-white/60'}`}>
              {tab === 'all' ? 'All Products' : tab}
              <span className={`ml-2 text-[9px] px-2 py-0.5 rounded-full font-black ${activeTab === tab ? 'bg-[#FEDE00]/20 text-[#FEDE00]' : 'bg-white/5 text-white/30'}`}>{tabCounts[tab]}</span>
            </button>
          ))}
        </div>

        {/* ── FILTERS via ProductFilters component ───────────────────────────── */}
        {/*
          Category aur SubCategory is page par URL se already fix hain,
          isliye showCategoryFilter={false} aur showSubCategoryFilter={false}.
          Sirf Search + Listing Type filter dikhega.
        */}
        <ProductFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={[]}
          categoryFilter="all"
          onCategoryChange={() => {}}
          subCategories={[]}
          subCategoryFilter="all"
          onSubCategoryChange={() => {}}
          listingTypeFilter={listingTypeFilter}
          onListingTypeChange={setListingTypeFilter}
          showCategoryFilter={false}
          showSubCategoryFilter={false}
        />

        {/* ── TABLE ──────────────────────────────────────────────────────────── */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-visible">

          {/* Table Header */}
          <div className="grid grid-cols-[40px_60px_2fr_140px_100px_120px_80px_80px_60px] gap-4 px-6 py-4 border-b border-white/5 bg-white/[0.02] rounded-t-2xl items-center">
            <div onClick={toggleSelectAll} className="cursor-pointer flex items-center justify-center">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${allPageSelected ? 'bg-[#FEDE00] border-[#FEDE00]' : someSelected ? 'bg-[#FEDE00]/30 border-[#FEDE00]/50' : 'border-white/20 hover:border-white/40'}`}>
                {allPageSelected && <span className="text-black text-[10px] font-black">✓</span>}
                {!allPageSelected && someSelected && <span className="text-[#FEDE00] text-[10px] font-black">—</span>}
              </div>
            </div>
            {['', 'Product', 'Price (₹)', 'Stock', 'Status', 'Order', 'Save', ''].map((h, i) => (
              <div key={i} className="text-[9px] font-black uppercase tracking-widest text-white/25">{h}</div>
            ))}
          </div>

          {/* Table Rows */}
          {paginatedProducts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-white/20 font-black uppercase text-xs tracking-widest">No products found</p>
            </div>
          ) : (
            paginatedProducts.map((product) => {
              const realIdx = products.findIndex(p => p.id === product.id);
              const vals = editValues[product.id] || { price: product.price?.toString() || '', stock: product.stock?.toString() || '0' };
              const isDirty = dirtyIds.has(product.id);
              const isSaving = savingIds.has(product.id);
              const isVariation = product.listing_type === 'variation';

              return (
                <div
                  key={product.id}
                  className={`grid grid-cols-[40px_60px_2fr_140px_100px_120px_80px_80px_60px] gap-4 px-6 py-4 border-b border-white/[0.04] transition-all items-center group ${
                    isDirty ? 'bg-[#FEDE00]/[0.03] border-l-2 border-l-[#FEDE00]/40' :
                    selectedIds.has(product.id) ? 'bg-[#FEDE00]/[0.04] border-l-2 border-l-[#FEDE00]/30' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Checkbox */}
                  <div onClick={() => toggleSelect(product.id)} className="cursor-pointer flex items-center justify-center">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedIds.has(product.id) ? 'bg-[#FEDE00] border-[#FEDE00]' : 'border-white/20 hover:border-white/50'}`}>
                      {selectedIds.has(product.id) && <span className="text-black text-[10px] font-black">✓</span>}
                    </div>
                  </div>

                  {/* Image */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/5 flex-shrink-0">
                    {product.main_image
                      ? <img src={product.main_image} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-white/10 text-[8px] font-black">N/A</div>
                    }
                  </div>

                  {/* Product Name */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-black uppercase tracking-tight text-white leading-tight line-clamp-1 hover:text-[#FEDE00] transition-colors cursor-pointer"
                      >
                        {product.title_name}
                      </Link>
                      {isVariation && (
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FEDE00]/10 text-[#FEDE00] border border-[#FEDE00]/20 flex-shrink-0">Variation</span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/30 font-medium">{product.short_description || '—'}</p>
                  </div>

                  {/* ── InlineEditRow: Price + Stock + Save/Cancel (3 cells) ── */}
                  <InlineEditRow
                    productId={product.id}
                    vals={vals}
                    isDirty={isDirty}
                    isSaving={isSaving}
                    isVariation={isVariation}
                    onFieldChange={handleFieldChange}
                    onSave={handleSaveSingle}
                    onCancel={handleCancelEdit}
                    variationPriceNode={renderVariationPrice(product)}
                  />

                  {/* Status */}
                  <div>
                    <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border ${
                      product.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      product.status === 'Featured' ? 'bg-[#FEDE00]/10 text-[#FEDE00] border-[#FEDE00]/20' :
                      'bg-white/5 text-white/30 border-white/10'
                    }`}>{product.status || 'Draft'}</span>
                  </div>

                  {/* Order arrows */}
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleMove(realIdx, 'up')} disabled={realIdx === 0}
                      className="p-1.5 rounded-lg hover:bg-[#FEDE00]/10 text-white/20 hover:text-[#FEDE00] disabled:opacity-10 transition-all">
                      <ArrowUp size={13} />
                    </button>
                    <button onClick={() => handleMove(realIdx, 'down')} disabled={realIdx === products.length - 1}
                      className="p-1.5 rounded-lg hover:bg-[#FEDE00]/10 text-white/20 hover:text-[#FEDE00] disabled:opacity-10 transition-all">
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  {/* 3-dot context menu */}
                  <div className="relative flex justify-end col-span-1">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                      className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === product.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-full mt-2 w-52 rounded-2xl z-[9999] overflow-hidden"
                        style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
                      >
                        <Link
                          href={`/admin/inventory/${categorySlug}/${subCategorySlug}/${product.id}`}
                          className="flex items-center gap-3 px-5 py-3.5 text-[11px] font-black uppercase transition-all"
                          style={{ color: 'rgba(255,255,255,0.85)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Edit3 size={14} className="text-[#FEDE00]" /> Edit Listing
                        </Link>
                        <button
                          onClick={() => handleCopy(product)}
                          className="w-full flex items-center gap-3 px-5 py-3.5 text-[11px] font-black uppercase transition-all"
                          style={{ color: 'rgba(255,255,255,0.85)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Copy size={14} className="text-[#FEDE00]" /> Copy Listing
                        </button>
                        <button
                          onClick={() => handleClose(product.id)}
                          className="w-full flex items-center gap-3 px-5 py-3.5 text-[11px] font-black uppercase transition-all"
                          style={{ color: 'rgba(255,255,255,0.85)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <XCircle size={14} className="text-orange-400" /> Close Listing
                        </button>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="w-full flex items-center gap-3 px-5 py-3.5 text-[11px] font-black uppercase text-red-400 transition-all"
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
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

        {/* ── PAGINATION ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
            {filtered.length === 0 ? 'No results' : `Showing ${startItem}–${endItem} of ${filtered.length} products`}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-xl border transition-all ${currentPage === 1 ? 'border-white/5 text-white/15 cursor-not-allowed' : 'border-white/10 text-white/50 hover:border-[#FEDE00]/40 hover:text-[#FEDE00]'}`}
            >
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
                page === '...' ? (
                  <span key={i} className="px-2 text-white/20 text-[11px] font-black">···</span>
                ) : (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(page as number)}
                    className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all border ${currentPage === page ? 'bg-[#FEDE00] text-black border-[#FEDE00]' : 'border-white/10 text-white/40 hover:border-[#FEDE00]/40 hover:text-[#FEDE00]'}`}
                  >
                    {page}
                  </button>
                )
              )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-xl border transition-all ${currentPage === totalPages ? 'border-white/5 text-white/15 cursor-not-allowed' : 'border-white/10 text-white/50 hover:border-[#FEDE00]/40 hover:text-[#FEDE00]'}`}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="relative" ref={perPageRef}>
            <button
              onClick={() => setShowPerPageDropdown(v => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-[11px] font-black uppercase text-white/50 hover:border-[#FEDE00]/30 hover:text-white/80 transition-all"
            >
              {resultsPerPage} per page
              <ChevronDown size={12} className={`transition-transform ${showPerPageDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showPerPageDropdown && (
              <div
                className="absolute right-0 bottom-full mb-2 rounded-xl overflow-hidden z-[9999] min-w-[160px]"
                style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}
              >
                <p className="text-[8px] font-black uppercase text-white/20 tracking-widest px-4 pt-3 pb-2">Results per page</p>
                {PER_PAGE_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setResultsPerPage(opt); setShowPerPageDropdown(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-[11px] font-black uppercase transition-all ${resultsPerPage === opt ? 'text-[#FEDE00] bg-[#FEDE00]/10' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  >
                    <span>{opt} results per page</span>
                    {resultsPerPage === opt && <span className="text-[#FEDE00]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BULK ACTION BAR (floating) ────────────────────────────────────── */}
      <BulkActionBar
        dirtyCount={dirtyIds.size}
        onSaveAll={handleSaveAll}
        selectedCount={selectedIds.size}
        bulkLoading={bulkLoading}
        allSelectedInPack={allSelectedInPack}
        onDelete={bulkDelete}
        onClose={bulkClose}
        onFeatured={bulkFeatured}
        onShowInPack={handleShowInPack}
        onCancel={() => { resetDirtyEdits(); setSelectedIds(new Set()); }}
      />
    </div>
  );
}
