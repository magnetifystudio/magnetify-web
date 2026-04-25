"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, Search, Trash2, ArrowUp, ArrowDown } from "lucide-react";

type Product = {
  id: string;
  title_name: string;
  price: number;
  main_image: string;
  slug: string;
  status: string;
};

type FeaturedItem = {
  id: string;
  product_id: string;
  display_order: number;
  is_active: boolean;
};

export default function FeaturedItemsManager() {
  const supabase = createClient();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: products } = await supabase
        .from("magnetify_products")
        .select("id, title_name, price, main_image, slug, status")
        .eq("status", "Featured")
  .order("title_name");
      const { data: featured } = await supabase
        .from("featured_items")
        .select("*")
        .order("display_order");
      setAllProducts(products || []);
      setFeaturedItems(featured || []);
      setLoading(false);
    }
    load();
  }, []);

  const isFeatured = (productId: string) =>
    featuredItems.some((f) => f.product_id === productId);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleFeatured = async (product: Product) => {
    if (isFeatured(product.id)) {
      const item = featuredItems.find((f) => f.product_id === product.id);
      if (!item) return;
      const { error } = await supabase.from("featured_items").delete().eq("id", item.id);
      if (!error) {
        setFeaturedItems((prev) => prev.filter((f) => f.product_id !== product.id));
        showToast(`"${product.title_name}" removed from featured`);
      }
    } else {
      const newOrder = featuredItems.length;
      const { data, error } = await supabase
        .from("featured_items")
        .insert({ product_id: product.id, display_order: newOrder, is_active: true })
        .select()
        .single();
      if (!error && data) {
        setFeaturedItems((prev) => [...prev, data]);
        showToast(`"${product.title_name}" added to featured`);
      }
    }
  };

  const moveItem = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= featuredItems.length) return;
    const updated = [...featuredItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFeaturedItems(updated);
    await supabase.from("featured_items").update({ display_order: 99999 }).eq("id", updated[index].id);
    await supabase.from("featured_items").update({ display_order: index }).eq("id", updated[targetIndex].id);
    await supabase.from("featured_items").update({ display_order: targetIndex }).eq("id", updated[index].id);
  };

  const removeFromFeatured = async (item: FeaturedItem) => {
    const { error } = await supabase.from("featured_items").delete().eq("id", item.id);
    if (!error) {
      setFeaturedItems((prev) => prev.filter((f) => f.id !== item.id));
      showToast("Removed from featured");
    }
  };

  const filteredProducts = allProducts.filter((p) =>
    p.title_name.toLowerCase().includes(search.toLowerCase())
  );

  const featuredProducts = featuredItems
    .map((f) => ({ item: f, product: allProducts.find((p) => p.id === f.product_id) }))
    .filter((x) => x.product) as { item: FeaturedItem; product: Product }[];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-[13px] font-black shadow-2xl transition-all ${
          toast.type === "success" ? "bg-green-500/20 border border-green-500/30 text-green-400" : "bg-red-500/20 border border-red-500/30 text-red-400"
        }`}>
          {toast.type === "success" ? "✓" : "✗"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/5 px-8 py-6 sticky top-0 bg-[#0A0A0A] z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Featured Items</h1>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Magnetify Studio / Storefront</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#FEDE00]/10 border border-[#FEDE00]/20 rounded-full px-4 py-2">
              <Star size={12} className="text-[#FEDE00]" />
              <span className="text-[#FEDE00] text-[12px] font-black">{featuredItems.length} Featured</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

        {/* LEFT: All Products Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-white/40">All Products</h2>
            <span className="text-[10px] text-white/20 font-bold uppercase">{filteredProducts.length} results</span>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all font-medium"
            />
          </div>

          {/* Table */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[40px_60px_1fr_100px_80px_80px] gap-4 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              {["", "", "Product", "Status", "Price", "Featured"].map((h, i) => (
                <div key={i} className="text-[9px] font-black uppercase tracking-widest text-white/25">{h}</div>
              ))}
            </div>

            {loading ? (
              <div className="py-20 text-center text-[#FEDE00] font-black uppercase text-xs tracking-widest animate-pulse">
                Loading Products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center text-white/20 font-black uppercase text-xs tracking-widest">
                No products found
              </div>
            ) : (
              filteredProducts.map((product) => {
                const featured = isFeatured(product.id);
                return (
                  <div key={product.id}
                    className={`grid grid-cols-[40px_60px_1fr_100px_80px_80px] gap-4 px-6 py-4 border-b border-white/[0.04] items-center transition-all hover:bg-white/[0.02] ${
                      featured ? "bg-[#FEDE00]/[0.03] border-l-2 border-l-[#FEDE00]/40" : ""
                    }`}>

                    {/* Checkbox */}
                    <div onClick={() => toggleFeatured(product)} className="cursor-pointer flex items-center justify-center">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        featured ? "bg-[#FEDE00] border-[#FEDE00]" : "border-white/20 hover:border-white/50"
                      }`}>
                        {featured && <span className="text-black text-[10px] font-black">✓</span>}
                      </div>
                    </div>

                    {/* Image */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/5 flex-shrink-0">
                      {product.main_image
                        ? <img src={product.main_image} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-white/10 text-[8px] font-black">N/A</div>
                      }
                    </div>

                    {/* Name */}
                    <p className="text-sm font-black uppercase tracking-tight text-white leading-tight line-clamp-1">
                      {product.title_name}
                    </p>

                    {/* Status */}
                    <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border w-fit ${
                      product.status === "Active" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      product.status === "Featured" ? "bg-[#FEDE00]/10 text-[#FEDE00] border-[#FEDE00]/20" :
                      "bg-white/5 text-white/30 border-white/10"
                    }`}>{product.status || "Draft"}</span>

                    {/* Price */}
                    <span className="text-sm font-black text-[#FEDE00] italic">₹{product.price}</span>

                    {/* Star toggle */}
                    <button onClick={() => toggleFeatured(product)}
                      className={`p-2 rounded-xl transition-all ${
                        featured ? "text-[#FEDE00] bg-[#FEDE00]/10" : "text-white/20 hover:text-[#FEDE00] hover:bg-[#FEDE00]/10"
                      }`}>
                      <Star size={15} fill={featured ? "currentColor" : "none"} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Featured Order Panel */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-white/40">Homepage Order</h2>
            <span className="text-[10px] text-white/20 font-bold uppercase">Drag to reorder</span>
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
            {featuredProducts.length === 0 ? (
              <div className="py-20 text-center px-6">
                <Star size={28} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/20 font-black uppercase text-xs tracking-widest">No featured products yet</p>
                <p className="text-white/10 text-[11px] mt-2">Check products on the left to feature them</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {featuredProducts.map(({ item, product }, idx) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-all group">

                    {/* Order number */}
                    <div className="w-6 h-6 rounded-full bg-[#FEDE00]/10 border border-[#FEDE00]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#FEDE00] text-[10px] font-black">{idx + 1}</span>
                    </div>

                    {/* Image */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 border border-white/5 flex-shrink-0">
                      {product.main_image
                        ? <img src={product.main_image} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-white/5" />
                      }
                    </div>

                    {/* Name + price */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-black uppercase text-white leading-tight line-clamp-1">{product.title_name}</p>
                      <p className="text-[10px] text-[#FEDE00]/70 font-bold mt-0.5">₹{product.price}</p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveItem(idx, "up")} disabled={idx === 0}
                        className="p-1.5 rounded-lg hover:bg-[#FEDE00]/10 text-white/20 hover:text-[#FEDE00] disabled:opacity-10 transition-all">
                        <ArrowUp size={12} />
                      </button>
                      <button onClick={() => moveItem(idx, "down")} disabled={idx === featuredProducts.length - 1}
                        className="p-1.5 rounded-lg hover:bg-[#FEDE00]/10 text-white/20 hover:text-[#FEDE00] disabled:opacity-10 transition-all">
                        <ArrowDown size={12} />
                      </button>
                      <button onClick={() => removeFromFeatured(item)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="mt-4 bg-white/[0.03] border border-white/5 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">How it works</p>
            <p className="text-[11px] text-white/30 leading-relaxed">
              Check any product on the left to add it to the homepage Featured section. Use arrows to reorder. Changes save automatically.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
